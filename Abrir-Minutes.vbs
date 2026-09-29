Set shell = CreateObject("WScript.Shell")
Set files = CreateObject("Scripting.FileSystemObject")
folder = files.GetParentFolderName(WScript.ScriptFullName)
script = files.BuildPath(folder, "Iniciar-Minutes.ps1")
command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File """ & script & """"
shell.Run command, 0, False
