import "../sass/style.scss";
import autocomplete from "./modules/autocomplete";
import typeAhead from './modules/typeAhead';
import map from './modules/map';
import ajaxHeart from './modules/hearts';

import { $, $$ } from "./modules/bling";

autocomplete($("#address"), $("#lat"), $("#lng"));

typeAhead($('.search'))

map($("#map"));

const heartForms = $$('button.heart__button');
heartForms.on("submit", ajaxHeart);

