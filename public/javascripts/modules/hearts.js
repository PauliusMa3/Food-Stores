
import axios from 'axios';
import {$} from './bling';

function ajaxHearts(e) {
    e.preventDefault();
    console.log('Hey');
    console.log(this.action);
    axios.post(this.action)
        .then(res => {
            console.log(res.data);
            const isHearted = this.heart.classList.toggle('heart__button--hearted');
            $('.heart-count').textContent = res.data.length;
        })
        .catch(console.error);
}


export default ajaxHearts;