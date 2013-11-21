// PLUGIN_INFO//{{{
var PLUGIN_INFO = xml`
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>annotate by highlighting text on the web page</description>
    <author mail="kavinyao@gmail.com" homepage="http://hackab.it">kavinyao</author>
    <version>0.1</version>
    <minVersion>3.8</minVersion>
    <maxVersion>3.8</maxVersion>
    <updateURL>https://raw.github.com/kavinyao/vimperator-plugins/master/annotate.js</updateURL>
    <detail><![CDATA[

== COMMANDS ==
annotate:
    :annotate

]]></detail>
</VimperatorPlugin>`;
//}}}

(function() {
    // Shamelessly copied from highlight.js
    // https://github.com/kavinyao/highlight.js
    var slice = Array.prototype.slice;

    /**
     * Create <span> node which highlights text.
     */
    function create_highlight_span(doc) {
        var span = doc.createElement('span');
        //TODO: refactor to style
        span.setAttribute('style', 'background:#fae983;');
        return span;
    }

    /**
     * Highlight the whole text block.
     */
    function mark_whole(doc, text_node) {
        var span = create_highlight_span(doc);
        text_node.parentNode.replaceChild(span, text_node);
        span.appendChild(text_node);
    }

    /**
     * Highlight only part of text block.
     */
    function mark_partial(doc, text_node, offset, from_start) {
        var selected, rest;
        if(from_start) {
            // the ending node, should trim from start
            selected = text_node.data.substring(0, offset);
            rest = text_node.data.substring(offset);
        } else {
            // the starting node, should trim from end
            selected = text_node.data.substring(offset);
            rest = text_node.data.substring(0, offset);
        }

        var span = create_highlight_span(doc);
        span.appendChild(doc.createTextNode(selected));
        text_node.data = rest;
        if(from_start)
            text_node.parentNode.insertBefore(span, text_node);
        else
            text_node.parentNode.insertBefore(span, text_node.nextSibling);
    }

    /**
     * Run DFS to recursively highlight TextNodes
     * between config.start and config.end.
     */
    function dfs_mark(elem, config) {
        if(elem.nodeType === elem.TEXT_NODE) {
            if(elem === config.start) {
                config.in_range = true;
                mark_partial(config.doc, elem, config.start_offset, false);
            } else if(elem === config.end) {
                config.terminate = true;
                mark_partial(config.doc, elem, config.end_offset, true);
            } else if(config.in_range) {
                mark_whole(config.doc, elem);
            }
        } else if(elem.nodeType === elem.ELEMENT_NODE) {
            // Note: as we might add <span> nodes, should cache childNodes
            // to avoid infinite loop
            var i, childNodes = slice.call(elem.childNodes, 0);
            for(i = 0;i < childNodes.length && !config.terminate;i++) {
                dfs_mark(childNodes[i], config);
            }
        }
    }

    function highlight_selection(doc) {
        var sel = doc.getSelection();

        // only support highlight within TextNode
        if(!sel.anchorNode || !sel.toString()) {
            console.info('No text selected.');
            return;
        }

        if (sel.anchorNode === sel.focusNode) {
            console.info('Single node mode');
            var text_node = sel.anchorNode;
            var full_text = text_node.data;
            // use min/max to handle backward selection
            var selected = full_text.slice(
                Math.min(sel.anchorOffset, sel.focusOffset),
                Math.max(sel.anchorOffset, sel.focusOffset)
            );
            var sides = full_text.split(selected);

            // replace original with annotated nodes
            text_node.data = sides[0];
            var span = create_highlight_span(doc);
            span.appendChild(doc.createTextNode(selected));
            text_node.parentNode.insertBefore(span, text_node.nextSibling);
            text_node.parentNode.insertBefore(doc.createTextNode(sides[1]), span.nextSibling);
        } else {
            console.info('Cross node mode');
            // find lowest common ancestor
            var traverse_root = sel.anchorNode.parentNode;
            while(!traverse_root.contains(sel.focusNode))
                traverse_root = traverse_root.parentNode;

            // determine which is first in DFS
            // using TreeWalker said to be fast: http://stackoverflow.com/q/2579666/1240620
            var tree_walker = doc.createTreeWalker(traverse_root, NodeFilter.SHOW_TEXT, null, false);
            var forward_selection, t_node;
            while((t_node = tree_walker.nextNode())) {
                if(t_node === sel.anchorNode || t_node === sel.focusNode) {
                    forward_selection = (t_node === sel.anchorNode);
                    break;
                }
            }

            console.info(forward_selection ? 'Forward selection' : 'Backward selection');

            var start_prefix = ['focus', 'anchor'][+forward_selection];
            var end_prefix = ['focus', 'anchor'][+!forward_selection];
            var config = {
                doc: doc,
                start: sel[start_prefix+'Node'],
                start_offset: sel[start_prefix+'Offset'],
                end: sel[end_prefix+'Node'],
                end_offset: sel[end_prefix+'Offset'],
                in_range: false,
                terminate: false
            };

            dfs_mark(traverse_root, config);
        }

        // cancel selection
        sel.collapseToStart();
    }

    commands.addUserCommand(["anno[tate]"], "annotate by highlighting text on the web page",
        function(args){
            var doc = gBrowser.selectedBrowser.contentDocument;
            highlight_selection(doc);
        },
        {
            bang: true,
            literal: 1,
        },
        true
        );

})();
// vim: fdm=marker sw=4 ts=4 et:
