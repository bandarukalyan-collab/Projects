@echo off
set PYTHON_EXE=..\.venv\Scripts\python.exe
cls
powershell -Command "& '%PYTHON_EXE%' main.py EFDRP 2>&1 | Select-String -Pattern 'Please complete the authentication process' -NotMatch"
cls
powershell -Command "& '%PYTHON_EXE%' main.py FDRP 2>&1 | Select-String -Pattern 'Please complete the authentication process' -NotMatch"
cls
powershell -Command "& '%PYTHON_EXE%' main.py PPIDP 2>&1 | Select-String -Pattern 'Please complete the authentication process' -NotMatch"
