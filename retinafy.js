// PLUGIN_INFO//{{{
var PLUGIN_INFO = xml`
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>make image preview retina-compatible</description>
    <author mail="kavinyao@gmail.com" homepage="http://hackab.it">kavinyao</author>
    <version>0.1</version>
    <minVersion>3.7</minVersion>
    <maxVersion>3.7</maxVersion>
    <updateURL>https://raw.github.com/kavinyao/vimperator-plugins/master/retinafy.js</updateURL>
    <detail><![CDATA[

== COMMANDS ==
retinafy:
    :retinafy

]]></detail>
</VimperatorPlugin>`;
//}}}

(function() {
    commands.addUserCommand(["retinafy"], "make image preview retina-compatible",
        function(args){
            var img = gBrowser.selectedBrowser.contentDocument.querySelector('img');
            // restore original size
            img.removeAttribute('width');
            img.removeAttribute('height');
            var width = img.width;
            img.width = width / 2;
        },
        {
            bang: true,
            literal: 1,
        },
        true
        );

})();
// vim: fdm=marker sw=4 ts=4 et:
