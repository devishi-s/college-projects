from flask import Flask, render_template, request
import mysql.connector
from mysql.connector import Error
import os


app = Flask(__name__)

# ----------------------------
# ----------------------------
# For a local setup, you can set these environment variables:
#   MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
#
# Example (PowerShell):
#   $env:MYSQL_PASSWORD="your_password"
#
# Defaults assume a local MySQL with root user.
MYSQL_CONFIG = {
    "host": os.environ.get("MYSQL_HOST", "localhost"),
    "user": os.environ.get("MYSQL_USER", "root"),
    "password": os.environ.get("MYSQL_PASSWORD", "root"),
    "database": os.environ.get("MYSQL_DATABASE", "carbon_footprint"),
}


# ----------------------------
# SQL schema reference (run in MySQL)
# ----------------------------
# CREATE DATABASE carbon_footprint;
# USE carbon_footprint;
#
# CREATE TABLE Records (
#   id INT PRIMARY KEY AUTO_INCREMENT,
#   name VARCHAR(255),
#   transport_type VARCHAR(50),
#   distance FLOAT,
#   electricity_usage FLOAT,
#   diet_type VARCHAR(50),
#   total_emission FLOAT,
#   category VARCHAR(20),
#   date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
# );


def get_db_connection():
    """Create a MySQL connection using MYSQL_CONFIG."""
    return mysql.connector.connect(**MYSQL_CONFIG)


def calculate_total_emission(transport_type: str, distance_km: float, electricity_units: float, diet_type: str):
    """Compute total emission using the given emission factors."""
    transport_factors = {
        "car": 0.2,   # kg CO2 per km
        "bike": 0.1,
        "bus": 0.05,
        "walk": 0.0,
    }
    diet_factors = {
        "veg": 1.0,       # kg CO2
        "non-veg": 2.5,
    }

    transport_emission = transport_factors[transport_type] * distance_km
    electricity_emission = 0.5 * electricity_units  # kg CO2 per unit
    diet_emission = diet_factors[diet_type]

    total_emission = transport_emission + electricity_emission + diet_emission

    if total_emission < 5:
        category = "Low"
    elif 5 <= total_emission <= 15:
        category = "Medium"
    else:
        category = "High"

    # Round for nicer display (database stores floats, so rounding is safe for output).
    return round(total_emission, 2), category


@app.route("/")
def home():
    """Home page with input form."""
    return render_template(
        "index.html",
        error=None,
        form_values={},
    )


@app.route("/calculate", methods=["POST"])
def calculate():
    """Handle form submission, calculate emissions, store in MySQL, and show the result."""
    name = (request.form.get("name") or "").strip()
    transport_type = (request.form.get("transport_type") or "").strip().lower()
    diet_type = (request.form.get("diet_type") or "").strip().lower()

    # Convert numeric fields safely (beginner-friendly validation).
    try:
        distance = float(request.form.get("distance"))
        electricity_usage = float(request.form.get("electricity_usage"))
    except (TypeError, ValueError):
        distance = -1
        electricity_usage = -1

    valid_transport = {"car", "bike", "bus", "walk"}
    valid_diet = {"veg", "non-veg"}

    form_values = {
        "name": name,
        "transport_type": transport_type,
        "distance": request.form.get("distance") or "",
        "electricity_usage": request.form.get("electricity_usage") or "",
        "diet_type": diet_type,
    }

    error = None
    if not name:
        error = "Please enter your name."
    elif transport_type not in valid_transport:
        error = "Please select a valid transport type."
    elif diet_type not in valid_diet:
        error = "Please select a valid diet type."
    elif distance < 0:
        error = "Distance must be a valid non-negative number."
    elif electricity_usage < 0:
        error = "Electricity usage must be a valid non-negative number."

    if error:
        return render_template("index.html", error=error, form_values=form_values)

    total_emission, category = calculate_total_emission(
        transport_type=transport_type,
        distance_km=distance,
        electricity_units=electricity_usage,
        diet_type=diet_type,
    )

    # Insert into database.
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        insert_query = """
            INSERT INTO Records
            (name, transport_type, distance, electricity_usage, diet_type, total_emission, category)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(
            insert_query,
            (name, transport_type, distance, electricity_usage, diet_type, total_emission, category),
        )
        conn.commit()
    except Error as e:
        # Show a friendly message if DB connection fails.
        error = f"Database error: {e}"
        return render_template("index.html", error=error, form_values=form_values)
    finally:
        try:
            cursor.close()
            conn.close()
        except Exception:
            pass

    return render_template(
        "result.html",
        name=name,
        transport_type=transport_type,
        distance=distance,
        electricity_usage=electricity_usage,
        diet_type=diet_type,
        total_emission=total_emission,
        category=category,
    )


@app.route("/history")
def history():
    """Show all stored records."""
    # Minimal addition: read year from query parameter for yearly CO2 total
    year = request.args.get("year")
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Minimal addition: calculate yearly_total (SUM) with optional year filter
        if year:
            cursor.execute("SELECT SUM(total_emission) AS total FROM Records WHERE YEAR(date) = %s", (year,))
        else:
            cursor.execute("SELECT SUM(total_emission) AS total FROM Records")
        yearly_total_row = cursor.fetchone()
        yearly_total = (yearly_total_row.get("total") if yearly_total_row else 0) or 0

        cursor.execute(
            """
            SELECT
                id, name, transport_type, distance, electricity_usage,
                diet_type, total_emission, category, date
            FROM Records
            ORDER BY date DESC
            """
        )
        records = cursor.fetchall()
    except Error as e:
        records = []
        yearly_total = 0
        error = f"Database error: {e}"
        return render_template("history.html", records=records, error=error, yearly_total=yearly_total, year=year)
    finally:
        try:
            cursor.close()
            conn.close()
        except Exception:
            pass

    return render_template("history.html", records=records, error=None, yearly_total=yearly_total, year=year)


if __name__ == "__main__":
    # debug=True for local development (safe for college project).
    app.run(debug=True)

