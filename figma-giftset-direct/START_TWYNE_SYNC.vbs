Set sh = CreateObject("WScript.Shell")
cmd = sh.ExpandEnvironmentStrings("%USERPROFILE%\Documents\TWYNE-FIGMA-LIVE\figma-giftset-direct\TWYNE_LIVE_SYNC.cmd")
sh.Run Chr(34) & cmd & Chr(34), 0, False
