// PLUGIN_INFO//{{{
var PLUGIN_INFO = xml`
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>make plain old webpage look modern</description>
    <author mail="kavinyao@gmail.com" homepage="http://hackab.it">kavinyao</author>
    <version>0.1</version>
    <minVersion>3.7</minVersion>
    <maxVersion>3.7</maxVersion>
    <updateURL>https://raw.github.com/kavinyao/vimperator-plugins/master/modernize.js</updateURL>
    <detail><![CDATA[

== COMMANDS ==
modernize:
    :modernize

]]></detail>
</VimperatorPlugin>`;
//}}}

(function() {
    commands.addUserCommand(["modern[ize]"], "make plain old webpage look modern",
        function(args){
            var body = gBrowser.selectedBrowser.contentDocument.body;
            body.style.fontFamily = '"Avenir Next", Avenir, Helvetica Neue';
            body.style.fontSize = '18px';
            body.style.width = '800px';
            body.style.marginLeft = body.style.marginRight = 'auto';
        },
        {
            bang: true,
            literal: 1,
        },
        true
        );

})();
// vim: fdm=marker sw=4 ts=4 et:
