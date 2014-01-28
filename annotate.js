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
    var DEFAULT_COLOR = '#fae983';
    var gcolor;

    /**
     * Find lowest common ancestor.
     * complexity: O(height(node1)+height(node2))
     */
    function find_lca(doc, node1, node2) {
        var height1 = 1, height2 = 1, diff;
        var n1 = node1, n2 = node2;

        // get heights of two nodes
        while(n1.parentNode != doc.body) {
            height1++;
            n1 = n1.parentNode;
        }

        while(n2.parentNode != doc.body) {
            height2++;
            n2 = n2.parentNode;
        }

        // advance the "higher" node by difference
        // node1 will always be the higher one
        diff = height1 - height2;
        if(diff < 0) {
            diff = -diff;
            n1 = node1;
            node1 = node2;
            node2 = n1;
        }
        while(diff-- > 0) node1 = node1.parentNode;

        // advance both nodes simultaneously
        while(node1.parentNode != node2.parentNode) {
            node1 = node1.parentNode;
            node2 = node2.parentNode;
        }

        return node1.parentNode;
    }

    /**
     * Create <span> node which highlights text.
     */
    function create_highlight_span(doc) {
        var span = doc.createElement('span');
        //TODO: refactor to style
        span.setAttribute('style', 'background:' + gcolor + ';');
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

    function highlight_selection(doc, color) {
        var sel = doc.getSelection();

        // only support highlight within TextNode
        if(!sel.anchorNode || !sel.toString()) {
            console.info('No text selected.');
            return;
        }

        // set color
        if(! color)
            color = DEFAULT_COLOR;
        gcolor = color;

        if(sel.anchorNode === sel.focusNode) {
            if(sel.anchorNode.nodeType === sel.anchorNode.TEXT_NODE) {
                console.info('Single text node mode');
                var text_node = sel.anchorNode;
                var full_text = text_node.data;
                // use min/max to handle backward selection
                var left = Math.min(sel.anchorOffset, sel.focusOffset);
                var right = Math.max(sel.anchorOffset, sel.focusOffset);

                // replace original with annotated nodes
                text_node.data = full_text.substring(0, left);
                var span = create_highlight_span(doc);
                span.appendChild(doc.createTextNode(full_text.substring(left, right)));
                text_node.parentNode.insertBefore(span, text_node.nextSibling);
                text_node.parentNode.insertBefore(doc.createTextNode(full_text.substring(right)), span.nextSibling);
            } else if(sel.anchorNode.nodeType === sel.anchorNode.ELEMENT_NODE) {
                console.info('Single element node mode');
                // an element is selected (e.g. by triple clicking in firefox)
                // should mark all TextNode
                // trick: always in range and never terminate => mark all
                var mark_all_config = {
                    doc: doc,
                    start: null,
                    start_offset: 0,
                    end: null,
                    end_offset: 0,
                    in_range: true,
                    terminate: false
                };

                dfs_mark(sel.anchorNode, mark_all_config);
            }
        } else {
            console.info('Cross node mode');
            // find lowest common ancestor
            // so that we traverse fewest nodes necessary when marking
            var traverse_root = find_lca(doc, sel.anchorNode, sel.focusNode);

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

    var builtin_colors = {
        y: '#fae983',
        g: '#cbf189',
        b: '#adc9f6',
        p: '#f6c4dd',
        pp: '#e4c8f3'
    };

    commands.addUserCommand(["a[nnotate]"], "annotate by highlighting text on the web page",
        function(args){
            var doc = gBrowser.selectedBrowser.contentDocument;
            var c = args[0];
            if(c in builtin_colors)
                c = builtin_colors[c];
            highlight_selection(doc, c);
        },
        {
            bang: true,
            literal: 1,
        },
        true
        );

})();
// vim: fdm=marker sw=4 ts=4 et:
