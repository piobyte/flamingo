# Changelog

### v1.6.0

- Changes gm dependency to be optional
- Removes ImageMagick, GraphicsMagick from Dockerfile
- Bumps dependencies to `sharp@0.15.0`

The reason for making gm optional and removing GraphicsMagick and ImageMagick from the Dockerfile 
is that libvips in its current form provides what we think a large amount of useful image processing operations 
without allowing local file modification and even code execution 
(see i.e. 
[CVE-2016-3714](https://www.cvedetails.com/cve/CVE-2016-3714/), 
[CVE-2016-3715](https://www.cvedetails.com/cve/CVE-2016-3715/), 
[CVE-2016-3716](https://www.cvedetails.com/cve/CVE-2016-3716/), 
[CVE-2016-3717](https://www.cvedetails.com/cve/CVE-2016-3717/), 
[CVE-2016-3718](https://www.cvedetails.com/cve/CVE-2016-3718/)
).

If you still want to continue using ImageMagick, please apply the mitigations mentioned on [https://imagetragick.com/](https://imagetragick.com/)
