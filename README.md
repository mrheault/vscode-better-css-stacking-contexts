![Icon](https://raw.githubusercontent.com/mrheault/vscode-better-css-stacking-contexts/main/images/better-stacking-contexts-icon.png)

# VSCode Better CSS Stacking Contexts ![Version](https://img.shields.io/visual-studio-marketplace/v/mikerheault.vscode-better-css-stacking-contexts)

Better CSS Stacking Contexts is a VSCode extension designed to simplify managing z-index and stacking contexts in
CSS/SCSS. It provides visual cues and quick fixes to help developers create maintainable and bug-free layouts.

## ✨ Features

- **Stacking Context Highlighting**: Identifies and highlights new stacking contexts.
- **Z-Index Analysis**: Detects ineffective z-index values with visual warnings.
- **Quick Fixes**: Suggests fixes for ineffective z-index usage.
- **Real-time Feedback**: Provides insights into stacking context hierarchy as you type.
- **Tree View**: Navigable tree view of stacking contexts.

## 🛠️ Installation

There are several ways to install.

* Install from
  the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=mikerheault.vscode-better-css-stacking-contexts).
* From the VS Code Extensions view (`Ctrl+Shift+X`) or (` Cmd+Shift+X`), search for `Better CSS Stacking Contexts`.
* Run `ext install mikerheault.vscode-better-css-stacking-contexts` in the command palette (`Ctrl+Shift+P`)
  or (`Cmd+Shift+P`).

## ▶️ Demo

![Treeview Navigation](https://raw.githubusercontent.com/mrheault/vscode-better-css-stacking-contexts/main/images/Treeview-dark.gif)
*Treeview - Navigation to property*

![Quickfix Example](https://raw.githubusercontent.com/mrheault/vscode-better-css-stacking-contexts/main/images/quickfix-dark.gif)
*Quickfix - ineffective z-index*

## ⚙️ Configuration/Settings

<table>
  <thead>
    <tr>
      <th>Setting</th>
      <th>Description</th>
      <th>Type</th>
      <th>Default Value</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>betterStackingContexts.decorationColor</code></td>
      <td>Highlight color - hex value or <a href="https://code.visualstudio.com/api/references/theme-color">Theme Color token</a></td>
        <td>string</td>
      <td>editorInfo.foreground</td>
    </tr>
    <tr>
      <td><code>betterStackingContexts.messageText</code></td>
      <td>Decoration message text</td>
<td>string</td>
      <td>🤐 This property creates a new stacking context</td>
    </tr>
    <tr>
      <td><code>betterStackingContexts.stackingContextMethod</code></td>
      <td>Method for creating new stacking context (ineffective z-index quickfix)</td>
<td>enum: [
    position,
    isolation
  ],</td>
      <td>isolation</td>
    </tr>
    <tr>
      <td><code>betterStackingContexts.backgroundColor</code></td>
      <td>Background highlight color - hex value or <a href="https://code.visualstudio.com/api/references/theme-color">Theme Color token</a></td>
<td>string</td>
      <td>editor.hoverHighlightBackground</td>
    </tr>
  </tbody>
</table>

## 👨‍💻 Usage

The extension analyzes CSS/SCSS files automatically, highlighting regions and providing information and fixes for
stacking context and z-index issues.

## 🤝 Contributing

[Contributions are welcome!](https://github.com/mrheault/vscode-better-css-stacking-contexts/pulls)

## 📜 License

Licensed under the MIT License.

## 🚨 Support

For issues or feature requests, [file an issue](https://github.com/mrheault/vscode-better-css-stacking-contexts/issues).

## 📢 Release Notes

[Change log here](https://github.com/mrheault/vscode-better-css-stacking-contexts/blob/main/CHANGELOG.md)
