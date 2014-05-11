// PLUGIN_INFO//{{{
var PLUGIN_INFO = xml`
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>generate QR code for current URL</description>
    <author mail="kavinyao@gmail.com" homepage="http://hackab.it">kavinyao</author>
    <version>0.1</version>
    <minVersion>3.8</minVersion>
    <maxVersion>3.8</maxVersion>
    <updateURL>https://raw.github.com/kavinyao/vimperator-plugins/master/qr.js</updateURL>
    <detail><![CDATA[

== COMMANDS ==
qr:
    :qr [size]

]]></detail>
</VimperatorPlugin>`;
//}}}

(function() {
    commands.addUserCommand(["qr"], "generate QR code for current URL",
        function(args){
            var size = 270;
            if (args.length > 0) {
                size = parseInt(args[0], 10);
            }

            var _window = gBrowser.selectedBrowser.contentWindow;
            var url = _window.location.href;
            // ES6 template string
            var endpoint = `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${url}`;

            _window.location = endpoint;
        },
        {
            bang: true,
            literal: 1,
        },
        true
        );

})();
