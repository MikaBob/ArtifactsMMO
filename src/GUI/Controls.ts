import { Fight, Gather, Craft } from '../Actions'
import { MoveRelatively } from '../Movement'

// Movements
const buttonMoveUp = document.createElement('button')
const buttonMoveDown = document.createElement('button')
const buttonMoveRight = document.createElement('button')
const buttonMoveLeft = document.createElement('button')

buttonMoveUp.innerHTML = 'Move Up'
buttonMoveDown.innerHTML = 'Move Down'
buttonMoveRight.innerHTML = 'Move Right'
buttonMoveLeft.innerHTML = 'Move Left'

buttonMoveUp.onclick = () => {
    MoveRelatively(0, -1)
}
buttonMoveDown.onclick = () => {
    MoveRelatively(0, 1)
}
buttonMoveRight.onclick = () => {
    MoveRelatively(1, 0)
}
buttonMoveLeft.onclick = () => {
    MoveRelatively(-1, 0)
}

const movementControls = [buttonMoveUp, buttonMoveDown, buttonMoveRight, buttonMoveLeft]

// Basic Actions
const buttonFight = document.createElement('button')
const buttonGather = document.createElement('button')
const buttonCraft = document.createElement('button')

buttonFight.innerHTML = 'Fight'
buttonGather.innerHTML = 'Gather'
buttonCraft.innerHTML = 'Craft'

buttonFight.onclick = Fight
buttonGather.onclick = Gather
buttonCraft.onclick = () => {
    Craft('copper')
}

const actionControls = [buttonFight, buttonGather, buttonCraft]

export default [...movementControls, ...actionControls]
