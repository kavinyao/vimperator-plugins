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
    var solarizedStyles = 'body {background-color:#003945;color:#FFFFFF;} h1,h2,h3,h4 {color: #AEBF45;} a,a:link {color:#FD6957 !important;}';

    commands.addUserCommand(["modern[ize]"], "make plain old webpage look modern",
        function(args){
            var document = gBrowser.selectedBrowser.contentDocument;
            var body = document.body;
            body.style.fontFamily = '"Avenir Next", Avenir, Helvetica Neue';
            body.style.fontSize = '18px';
            body.style.width = '800px';
            body.style.marginLeft = body.style.marginRight = 'auto';

            if (args[0] === '-s') {
                // get solarized
                var style = document.createElement('style');
                style.type = 'text/css';
                style.appendChild(document.createTextNode(solarizedStyles));
                document.head.appendChild(style);
            }
        },
        {
            bang: true,
            literal: 1,
        },
        true
        );

})();
// vim: fdm=marker sw=4 ts=4 et:
