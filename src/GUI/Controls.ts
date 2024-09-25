import { MoveDown, MoveLeft, MoveRight, MoveUp } from '../Movement'

const buttonMoveUp = document.createElement('button')
const buttonMoveDown = document.createElement('button')
const buttonMoveRight = document.createElement('button')
const buttonMoveLeft = document.createElement('button')

buttonMoveUp.innerHTML = 'Move Up'
buttonMoveDown.innerHTML = 'Move Down'
buttonMoveRight.innerHTML = 'Move Right'
buttonMoveLeft.innerHTML = 'Move Left'

buttonMoveUp.onclick = MoveUp
buttonMoveDown.onclick = MoveDown
buttonMoveRight.onclick = MoveRight
buttonMoveLeft.onclick = MoveLeft

export default [buttonMoveUp, buttonMoveDown, buttonMoveRight, buttonMoveLeft]
