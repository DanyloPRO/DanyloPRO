from flask import Flask

app = Flask(__name__)

if __name__ == "__main__":
    app.run()
    # Defining the home page of our site
@app.route("/")  # this sets the route to this page
def home():
	return "Hello! this is the main page <h1>HELLO</h1>"  # some basic inline html
@app.route("/<Sviatoslav>")
def user(Sviatoslav):
    return f"Hello {Sviatoslav}!"
from flask import Flask, redirect, url_for
@app.route("/admin")
def admin():
	return redirect(url_for("home"))

