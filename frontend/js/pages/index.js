import 'domReady';
import 'jQuery-MultiSelect';
import addHtml from '../module/add-html';

import 'index.twig';
import indexContent from  '_index-start.twig';
import 'style';

function entry() {
    let pages = [];
    for(let keys in getEntry) {
        if(keys === 'index') continue;
        let path = getEntry[keys].replace(/.\//, '/');
        pages.push({name: `${keys}.html`, href: `${path}.html`});
    }
    return pages;
}

let info = {
    title: 'Select Page',
    pages: entry()
};

addHtml( indexContent, info );

