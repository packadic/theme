# Getting started

## Building

### Pre-build
The pre-build version is located inside the `dist` folder. Minimized, optimized, etc. 
You can download the latest stable version [here](https://github.com/packadic/themes/releases/latest).

### Build it yourself

If you'd rather build it yourself, want to make use of the source code or something likewise, then you will need:
- node 10.x 
- ruby with bundler
- bower
- grunt-cli
- sassc (libsass)
  
  
Downloading, installing and building is fairly straightforward:
```bash
git clone https://github.com/packadic/theme
cd theme
npm install
bundle install
bower install
grunt build --target="dev"
```

For a complete distribution build (takes considerably longer to build):
```bash
grunt build --target="dist" --type="dist"
```

During development:
```bash
grunt watch
```

**Notice** the `config.yml` and `src/data/*.yml` files. There's quite a bit of configuration options in there, primarily used for during development and demo purposes.

## Creating a page
The generated demo pages contain some useless data to base your site on. 
Instead a clean empty layout file named `empty_layout.html` is provided to start off with.

At the bottom of the file you will see
```html
<script src="/assets/scripts/init.js"></script>
<script src="/assets/scripts/demo/your_custom_script.js"></script>
<script src="/assets/scripts/boot.js"></script>
```

Copy the `your_custom_script.js` to another location, change the `src` accordingly and open the script file. Take a moment to read the comments.

```javascript
(function () {

    var packadic = (window.packadic = window.packadic || {});

    // To alter any config value before booting, use the mergeConfig function.
    packadic.mergeConfig({
        debug: true
    });

    // Use the onBooted function to create callbacks to be executed when booted.
    packadic.onBooted(['jquery', 'theme', 'theme/sidebar', 'autoload'], function ($, theme, sidebar, autoload) {
        theme.init();
        sidebar.init({hidden: false});
        $(function () {
            autoload.scan($('body'), function () {
                if ( packadic.config.pageLoadedOnAutoloaded === true ) {
                    packadic.removePageLoader();
                }
            });
        });
    });

    // Alternatively, there are several other events that you can bind callbacks to
    // onPreBoot, onBoot, onBooted, onStart and onStarted

    // This is the place to load your scripts, adjust configurations, add autoloading plugins, etc..

}.call());
```

The `packadic` variable is the only global variable. Check the API documentation for a complete overview.
The `theme` and `sidebar` modules are handling its respective elements. Again, check the API documentation for a complete usage overview.
