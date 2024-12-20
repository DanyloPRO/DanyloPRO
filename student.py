from ..human.human import Human

class Student(Human):
    def __init__(self, name: str, age: int, gender: str, grade: int):
        super().__init__(name, age, gender, grade)
        self.grade = grade
        
          def graduate(self):
           super().aging(self)
           self.gerade = self.grade + 1

