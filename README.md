# VSCode Better CSS Stacking Contexts

Better CSS Stacking Contexts is a VSCode extension designed to simplify the process of managing z-index and stacking contexts in your CSS/SCSS. By providing visual cues and intelligent quick fixes, this extension helps developers create more maintainable and bug-free layouts.

## Features

* Stacking Context Highlighting: Automatically identifies and highlights elements that create new stacking contexts in your CSS files.
* Z-Index Analysis: Detects potentially ineffective z-index values and provides visual warnings.
* Quick Fixes: Offers intelligent suggestions to resolve ineffective z-index usage, improving your CSS/SCSS structure with a single click.
* Real-time Feedback: Works as you type, providing immediate insights into your stacking context hierarchy.


## Extension Settings

This extension contributes the following settings:

* `betterStackingContexts.decorationColor`: Color of the decoration used to highlight stacking contexts.
* `betterStackingContexts.messageText`: Message text displayed as a decoration.
* `betterStackingContexts.stackingContextMethod`: Method to use for creating a new stacking context. Options are `isolation: isolate;` and `position: relative;`.

## Usage
Once installed, the extension will automatically start analyzing your CSS/SCSS files. Look for highlighted regions and hover over z-index declarations to see detailed information and available quick fixes.

## Contributing
We welcome contributions! Please see our CONTRIBUTING.md file for details on how to get started.

## License
This project is licensed under the MIT License - see the LICENSE.md file for details.

## Support
If you encounter any issues or have feature requests, please file an issue on our GitHub repository.

## Release Notes

### 1.0.0

Initial release.


