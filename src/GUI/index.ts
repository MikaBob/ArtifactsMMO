import controls from './Controls'

const app = document.getElementById('app')
if (!app) throw "Coudn't find root element 'app'"

controls.map(htmlElment => {
    app.appendChild(htmlElment)
})
