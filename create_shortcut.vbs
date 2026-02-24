Set WshShell = WScript.CreateObject("WScript.Shell")
desktop = WshShell.SpecialFolders("Desktop")
Set lnk = WshShell.CreateShortcut(desktop & "\Sam Tetris.lnk")
lnk.TargetPath = "C:\Users\sambu\Desktop\PlayTetris.bat"
lnk.IconLocation = "C:\Users\sambu\Downloads\Tetris\sam_icon.ico"
lnk.Save
