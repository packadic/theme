# Packadic SCSS style structure

**Check `_howto.scss` to get the idea behind the import order and seperation logic used.**
Overriding and extending in SCSS is a bit backwards lol. bit confusing if not aware of it.


| File/Folder | Desc |
|:---|:---|
| `_base.scss` | Base variables, functions and mixins for everything beside theme specific stuff. |
| `_functions.scss` and `_mixins.scss` | Custom functions and mixins |
| `fast.scss` and `fast` | **IGNORE** used during development for faster coversion process as the `stylesheet.scss` file can take quite a few seconds.  |
| `stylesheet.scss` | The main stylesheet which should be the first referenced style in the HTML. |
| `themes` | The `stylesheet.scss` aims to contain mostly positional/dimensional definitions, `theme/theme-*.scss` contains markup definitions | 
| `vendor` | **IGNORE** |

The rest should be obv.
