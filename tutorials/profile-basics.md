
Flamingo profiles alias a list of image transformations. 
See `src/profiles/` the directory for example profile implementations.

Each profile function must resolve an object containing various fields:

- `response` {Object}
    - `header` {Object}
        - `key: value` - calls [reply](http://hapijs.com/api#replyerr-result)`.header(key, value)` to use custom response header fields
- `process` {Array} array of processor commands

__Example__

- `my-profile` profile
- uses [sharp](https://github.com/lovell/sharp)
- convert to `jpg`
- resize an image to 200x200 pixel
- set background color to `white`
- set response header `Content-Type` to `image/jpeg`
- available on `/image/my-profile/{url}`

```
// src/profiles/examples.js
module.exports = {
    // name the profile `my-profile` → available at `GET /image/my-profile/{url}`
    'my-profile': function (request, query) {
        // set the response header field `Content-Type` to `image/jpeg`
        return Promise.resolve({ response: { header: { 'Content-Type': 'image/jpeg' }},
            process: [{
                // use the `sharp` processor
                processor: 'sharp', pipe: function (pipe) {
                    // resize input to 200x200 px
                    return pipe.resize(200, 200)
                        // set the background to white
                        .background('white')
                        // convert to jpeg
                        .flatten().toFormat('jpeg');
                }
            }]
        });
    }
};
```
