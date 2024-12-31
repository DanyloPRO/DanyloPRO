result = []

def divider(a, b):    
    try:
        if a < b:        
            raise ValueError    
        if b > 100:        
            raise IndexError    
        return a/b
    except Exception as e:
        print(f"Error in divider function: {e}")
        return None
    
data = {10: 2, 2: 5, "123": 4, 18: 0, (): 15, 8 : 4} 

for key, value in data.items():    
    try:
        res = divider(key, value) 
        if res is not None:  
            result.append(res)
    except TypeError as e:
        print(f"TypeError with key {key} and value {value}: {e}") 
    except Exception as e:
        print(f"Unexpected error with key {key} and value {value}: {e}")
    
print(result)