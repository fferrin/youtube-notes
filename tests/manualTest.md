## Setup
- Go to brave://extensions/, search for the extension and click the "reload" button
- Go to any YouTube video (https://www.youtube.com/watch?v=dQw4w9WgXcQ)

## Init
- In the YouTube video, press Ctrl-Y or Cmd-Y -> The extension should open and show
  - Video title
  - Channel picture
  - Channel name and channel ID
  - Current time on the video
  - Text are to write a note
- Click on the extension in your browser. The same pop up should appear.
- Check the icon in the browse top bar shows a "0" below the icon.

## Interactions

Before you start, you will need to install the [Storage Area Explorer](https://chromewebstore.google.com/detail/storage-area-explorer/ocfjjjjhkpapocigimmppepjgfdecjkb) extension

### Create notes
- While the video is running, press Ctrl-Y to open the extension. Let's say you did that on the video time "XX:YY". Write a note in the text area and press "Save" -> You should see:
  - A new item in the list below with the time "XX:YY", the note you just wrote and a delete button.
  - A "1" below the extension icon in the browser top bar.
- Right click in the extension icon in the top bar and select the "Inspect pop-up" option. Go to the "Storage Explorer" tab -> You should see:
  - A key "channels" with value "{"UCuAXFkgsw1L7xaCfnd5JJOw" : "Rick Astley"}" ({<channelId>: <channelName>})
  - A key "UCuAXFkgsw1L7xaCfnd5JJOw" (`channelId`) with value "{"dQw4w9WgXcQ": "Rick Astley - Never Gonna Give You Up (Official Music Video)"}" (`{<videoId>: <videoName>}`)
  - A key "dQw4w9WgXcQ" (`videoId`) with value "{"XX:YY" : "<Your Note>"}"

### Edit notes
- Press Ctrl-Y to open the extension. Click in the timestamp of the note you just created -> It should:
  - Change the video time to the one from the note (`XX:YY`)
  - Set the note text in the text area
- Edit the note and save it -> It should:
  - Change the note in the list shown in the extension popup
  - Change the note in the Storage Explorer

### Remove notes
- Press Ctrl-Y to open the extension. Click in the "Delete" button on your note -> It should:
  - Remove the note from the list
  - Change the number in the extension icon from `1` to `0`
  - In the Storage Area, the only key remaining must be `channels` with the value `{}`

### Notes in multiple videos
Some things will change if you have multiple notes in the same video, notes in multiple videos of the same channels, notes in videos from multiple channels. If you remove a note and the video still have notes left, or you have notes in another video from that channel, the `channelId` and `channelName` won't be removed from the corresponding keys. Those values will only be removed if there is no more information regarding a specific video or a specific channel.
