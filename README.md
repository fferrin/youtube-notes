
<p align="center">
  <img src="https://github.com/fferrin/yt-notes/blob/master/extension/images/icon-128.png?raw=true" alt="FreeMedium image"/>
</p>

# YouTube Notes Extension

The YouTube Notes Chrome extension is a useful tool for taking timestamped notes on YouTube videos and storing them locally within your browser.

## Motivation

I utilize [Logseq](https://github.com/logseq/logseq/) for managing my personal notes. One of its standout features is the ability to annotate YouTube videos with timestamps, creating a link that seamlessly integrates video playback with my notes. You can view a screenshot of this feature HERE.

However, since my notes are not yet synchronized across all my devices, I often find myself consuming a ton of videos without taking notes on them, solely because Logseq isn't accessible at that moment. According to [Webtime Tracker](https://chromewebstore.google.com/detail/webtime-tracker/ppaojnbmmaigjmlpjaldnkgnklhicppk), a staggering 16.37% of my screen time is spent on YouTube. To address this, I've embarked on developing an extension that mimics Logseq's functionality, enabling me to jot down notes while watching YouTube videos and later transfer them to Logseq.

## Installation

Here are the instructions to install the YouTube Notes extension:

1. Download the extension files from the [this GitHub repository](https://github.com/fferrin/yt-notes).

2. Open Google Chrome and navigate to the Extensions page by clicking on the three-dot menu in the top right corner, then selecting "More tools" > "Extensions". Alternatively, you can directly access the Extensions page using this URL: `chrome://extensions`.

3. Enable **Developer mode** by toggling the switch located in the top right corner of the Extensions page.

4. Click on the **"Load unpacked"** button, then select the `extension` directory from the `yt-notes` directory you just downloaded.

5. Once selected, the YouTube Notes extension should now be successfully installed and visible in the list of installed extensions.

## Usage

To utilize the YouTube Notes extension effectively, follow these steps:

### 1. Pinning the Extension
It's recommended to pin the extension in your browser for easy access. Click the jigsaw icon in your browser toolbar, then select the pin icon for the YouTube Notes extension. If you prefer shortcuts, you can access it by pressing `Ctrl + Y` on Windows and Linux, or `Cmd + I` on Mac (the shortcut was chosen to be `Y` for easy remembrance (`Y`outTube), but on Mac, it opens the latest downloads).

### 2. Creating Notes
- Navigate to any YouTube video you want to take notes on.
- Play the video until the moment you want to take notes. You can pause the video or keep it playing. The extension will automatically capture the timestamp when you open it.

### 3. Editing Notes
- Open the extension on the video where you took notes.
- Locate the note you want to edit and click on the timestamp associated with that note.
- The video will be navigated to the corresponding moment, and the note will appear in the text box.
- Edit the note as desired and save it again.

### 4. Deleting Notes
- Open the extension on the video where you took notes.
- Find the note you want to delete and click on the trash icon.
- To confirm the deletion, select the check icon. Otherwise, click the cross icon.

### 5. Viewing All Notes
Please note that the functionality to view all notes directly within the extension is not yet implemented. However, you can still access your notes since they are stored locally in your browser. Follow these steps:

- Install the [Storage Area Explorer](https://chromewebstore.google.com/detail/storage-area-explorer/ocfjjjjhkpapocigimmppepjgfdecjkb) extension.
- Right-click on the extension icon in your browser's toolbar and select "Inspect pop-up."
- Navigate to the "Storage Explorer" tab. You will find your notes stored there, where you can remove, edit, or export them.

The format used to store the notes is as follows:

- The `channels` key stores all the channels for the videos you took notes on, formatted as `{channelId: channelName, ...}`.
- For each of the previous `channelId`s, you will find a key with the `channelId` storing the videos from that channel you took notes on, formatted as `{videoId: videoName, ...}`.
- Finally, for each video with ID `videoId`, you will find a key with the `videoId` storing the notes you took on that video, formatted as `{timestamp: note, ...}`.

## Roadmap

While the current version of the extension meets my current requirements, I have outlined additional features that I may consider implementing in the future, depending on available time and user feedback:

1. **Markdown Export**: Enable the ability to copy all notes from a video as Markdown, or save them directly in Markdown format. Other export formats may also be added based on user preferences.

2. **Top Bar Stats**: Display statistics in the top bar of the extension, showing the number of notes, videos, and channels associated with those notes, providing users with a quick overview of their note-taking activity.

3. **Light Mode**: Implement a light mode option for users who prefer a lighter interface. Currently, the extension defaults to a black theme.

4. **Dedicated Page for Viewing Notes**: Create a separate page within the extension where users can visualize all their notes without the need for additional browser extensions like Storage Area Explorer.

5. **Export Functionality**: Enhance the export functionality to allow users to export all their notes, videos, and associated channels in Markdown or JSON format, providing greater flexibility in managing and sharing their notes.

6. **Backup Configuration**: Introduce the ability for users to configure storage services such as Google Drive, Dropbox, etc., to automatically back up their notes, ensuring data safety and accessibility across devices.

These planned enhancements aim to further improve the usability and versatility of the YouTube Notes extension, providing users with a seamless note-taking experience while watching YouTube videos.


## Contributing

Contributions are welcome! If you have any ideas for improving the YouTube Notes extension or encounter any issues, feel free to [open an issue](https://github.com/fferrin/yt-notes/issues) or submit a pull request.

## License

This project is licensed under the [MIT License](https://github.com/git/git-scm.com/blob/main/MIT-LICENSE.txt).

<a href="https://www.buymeacoffee.com/fferrin" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

