# MMM-MyWastePickup

This a module for [MagicMirror](https://github.com/MichMich/MagicMirror).

This displays your waste pickup schedule from a CSV file.

![Screenshot](/../screenshots/screenshot.png?raw=true "Screenshot")


## Installation
1. Navigate into your MagicMirror `modules` folder and execute<br>
`git clone https://github.com/jclarke0000/MMM-MyWastePickup.git`.
2. Enter the new `MMM-MyWastePickup` directory and execute `npm install`.

## Configuration

The module reads your waste pickup schedule from a CSV file. The CSV file should have the following columns:
- **Subject** - The type of waste pickup (e.g., "Garbage", "Recycling")
- **Start Date** - The pickup date in `MM/DD/YYYY` format
- **All Day Event** - Set to `True` (currently unused)
- **Description** - Description of the pickup (optional)

### Configuration Options

<table>
  <thead>
    <tr>
      <th>Option</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>weeksToDisplay</code></td>
      <td>How many weeks into the future to show collection dates.<br /><br /><strong>Number</strong><br />Default: <code>2</code>.</td>
    </tr>
    <tr>
      <td><code>limitTo</code></td>
      <td>Limit the display to the specified number of pickups.<br /><br /><strong>Number</strong><br />Default: <code>99</code>.</td>
    </tr>
    <tr>
      <td><code>dateFormat</code></td>
      <td>Moment.js format string used for pickup dates other than Today, Tomorrow, and Day after tomorrow.<br /><br /><strong>String</strong><br />Default: <code>D. MMM</code>.</td>
    </tr>
    <tr>
      <td><code>showIcons</code></td>
      <td>Show an icon before the waste type label when the module can match the pickup type to a sprite symbol.<br /><br /><strong>Boolean</strong><br />Default: <code>true</code>.</td>
    </tr>
    <tr>
      <td><code>iconMap</code></td>
      <td>Optional mapping of waste type labels to sprite symbol IDs such as <code>garbage</code>, <code>recycle</code>, <code>compost</code>, <code>yard_waste</code>, and <code>christmas_tree</code>.<br /><br /><strong>Object</strong></td>
    </tr>
  </tbody>
</table>

Month and weekday names come from the active Moment.js locale. Slovak relative labels use the built-in locale where available, with <code>pozajtra</code> added explicitly for the two-day case.

### Example config

```javascript
{
  module: 'MMM-MyWastePickup',
  position: 'top_left',
  header: 'My Waste Collection',
  config: {
    weeksToDisplay: 2,
    limitTo: 99,
    dateFormat: 'D. MMM',
    showIcons: true,
    iconMap: {
      'Vývoz komunálu': 'garbage',
      'Zber papier a plasty': 'recycle'
    }
  }
}
```CSV File Format

Place your waste pickup schedule in a CSV file named `odpady.csv` in the module directory.

Example CSV file:
```
Subject,Start Date,All Day Event,Description
Garbage,04/01/2026,True,Black bin collection
Recycling,04/02/2026,True,Yellow/Blue bin collection
Garbage,04/15/2026,True,Black bin collection
Recycling,05/07/2026,True,Yellow/Blue bin collection
```

The module will automatically parse this file and display upcoming pickups based on the configured number of weeks.

The bundled SVG sprite in [icon_sprite.svg](icon_sprite.svg) currently includes these symbol IDs: <code>garbage</code>, <code>recycle</code>, <code>compost</code>, <code>yard_waste</code>, and <code>christmas_tree</code>.

## Updating the Schedule

Simply replace the `odpady.csv` file with your updated waste pickup schedule. The module will automatically reload the data.
3. Save the file as `schedule_custom.csv` in the `MMM-MyWasteCollection` directory.
4. Restart Magic Mirror


