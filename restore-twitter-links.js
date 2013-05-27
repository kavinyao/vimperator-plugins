// PLUGIN_INFO//{{{
var PLUGIN_INFO = xml`
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>restore original URL from t.co links</description>
    <author mail="kavinyao@gmail.com" homepage="http://hackab.it">kavinyao</author>
    <version>0.1</version>
    <minVersion>3.7</minVersion>
    <maxVersion>3.7</maxVersion>
    <updateURL>https://raw.github.com/kavinyao/vimperator-plugins/master/eliminate-t.co.js</updateURL>
    <detail><![CDATA[

== COMMANDS ==
tco:
    :tco

]]></detail>
</VimperatorPlugin>`;
//}}}

(function() {
    commands.addUserCommand(["tco"], "restore original URL from t.co links",
        function(args){
            var slice = Array.prototype.slice;
            var document = gBrowser.selectedBrowser.contentDocument;
            var tco_links = slice.call(document.querySelectorAll('.twitter-timeline-link'));
            var marker_class = 'x-hackabit-restored';

            tco_links.filter(function(link) {
                return !link.classList.contains(marker_class);
            }).forEach(function(link) {
                link.href = link.dataset.expandedUrl;
                link.classList.add(marker_class);
            });
        },
        {
            bang: true,
            literal: 1,
        },
        true
        );

})();
// vim: fdm=marker sw=4 ts=4 et:
