import 'domReady';
import 'jQuery-MultiSelect';
import addHtml from '../module/add-html';

import 'home.twig';
import homeContent from  'page/_home.twig';
import 'style';

import dataJSON from 'index-page';


addHtml(homeContent, dataJSON);

$( '.select' ).multiselect( {
    columns  : 1,
    selectAll: true,
    search   : true,
    texts    : {
        selectAll  : 'Выбрать все',
        placeholder: 'Select options'
    }
} );