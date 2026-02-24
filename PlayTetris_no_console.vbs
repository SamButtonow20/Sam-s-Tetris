Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
cwd = fso.GetParentFolderName(WScript.ScriptFullName)
venv = cwd & "\\.venv\\Scripts\\pythonw.exe"
script = cwd & "\\tetris_vs_ai.py"
If fso.FileExists(venv) Then
  cmd = Chr(34) & venv & Chr(34) & " " & Chr(34) & script & Chr(34)
Else
  cmd = "pythonw " & Chr(34) & script & Chr(34)
End If
' 0 = hide window, False = don't wait
shell.Run cmd, 0, False
