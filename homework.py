def calculate(expression):
    try:
        # Evaluating the expression using eval and returning the result
        result = eval(expression)
        return result
    except Exception as e:
        # Handling any errors that might occur during evaluation
        return f"Error: {str(e)}"
