# Configuration
The main configuration file is located in `assets/scripts/config.js`. 
This file however is not intended for your configuration, instead you should use the mergeConfig function as explained below.


On every page the following scripts are required:
```html
<script src="/assets/scripts/init.js"></script>
<script src="/assets/scripts/demo/outside_of_project.js"></script>
<script src="/assets/scripts/boot.js"></script>
```

You should replace the `outside_of_project.js` with your own script.
