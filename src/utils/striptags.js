/**
 * Note: this must be written is ES5 to be used in Cloudant search
 */
export default function striptags(html) {
  var STATE_OUTPUT = 0,
    STATE_HTML = 1,
    STATE_PRE_COMMENT = 2,
    STATE_COMMENT = 3;
  if (!html) html = '';
  var state = STATE_OUTPUT,
    depth = 0,
    output = '',
    inQuote = false,
    i,
    length,
    c;
  for (i = 0, length = html.length; i < length; i++) {
    c = html[i];
    switch (c) {
      case '<': {
        // ignore '<' if inside a quote
        if (inQuote) {
          break;
        }
        // '<' followed by a space is not a valid tag, continue
        if (html[i + 1] == ' ') {
          consumeCharacter(c);
          break;
        }
        // change to STATE_HTML
        if (state == STATE_OUTPUT) {
          state = STATE_HTML;
          consumeCharacter(c);
          break;
        }
        // ignore additional '<' characters when inside a tag
        if (state == STATE_HTML) {
          depth++;
          break;
        }
        consumeCharacter(c);
        break;
      }
      case '>': {
        // something like this is happening: '<<>>'
        if (depth) {
          depth--;
          break;
        }
        // ignore '>' if inside a quote
        if (inQuote) {
          break;
        }
        // an HTML tag was closed
        if (state == STATE_HTML) {
          inQuote = state = 0;
          break;
        }
        // '<!' met its ending '>'
        if (state == STATE_PRE_COMMENT) {
          inQuote = state = 0;
          break;
        }
        // if last two characters were '--', then end comment
        if (
          state == STATE_COMMENT &&
          html[i - 1] == '-' &&
          html[i - 2] == '-'
        ) {
          inQuote = state = 0;
          break;
        }
        consumeCharacter(c);
        break;
      }
      // catch both single and double quotes
      case '"':
      case "'": {
        if (state == STATE_HTML) {
          if (inQuote == c) {
            // end quote found
            inQuote = false;
          } else if (!inQuote) {
            // start quote only if not already in one
            inQuote = c;
          }
        }
        consumeCharacter(c);
        break;
      }
      case '!': {
        if (state == STATE_HTML && html[i - 1] == '<') {
          // looks like we might be starting a comment
          state = STATE_PRE_COMMENT;
          break;
        }
        consumeCharacter(c);
        break;
      }
      case '-': {
        // if the previous two characters were '!-', this is a comment
        if (
          state == STATE_PRE_COMMENT &&
          html[i - 1] == '-' &&
          html[i - 2] == '!'
        ) {
          state = STATE_COMMENT;
          break;
        }
        consumeCharacter(c);
        break;
      }
      case 'E':
      case 'e': {
        // check for DOCTYPE, because it looks like a comment and isn't
        if (
          state == STATE_PRE_COMMENT &&
          html.substr(i - 6, 7).toLowerCase() == 'doctype'
        ) {
          state = STATE_HTML;
          break;
        }
        consumeCharacter(c);
        break;
      }
      default: {
        consumeCharacter(c);
      }
    }
  }
  function consumeCharacter(c) {
    if (state == STATE_OUTPUT) {
      output += c;
    }
  }
  return output;
}
