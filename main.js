const prompt = require('prompt-sync')({sigint: true});
let process = require('process');

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';

class Field {
    _playerPosition = {
        row : -1,
        col : -1
    }
    _foundHat = false;

    constructor(fieldArray) {
        this._fieldArray = fieldArray;

        // placing the player at the top-left
        let isPlayerPlaced = false;
        for(let rowIndex=0; rowIndex < this._fieldArray.length; rowIndex++) {
            for(let colIndex=0; colIndex < this._fieldArray[rowIndex].length; colIndex++) {
                if(this._fieldArray[rowIndex][colIndex] === fieldCharacter) {
                    this._fieldArray[rowIndex][colIndex] = pathCharacter;
                    this._playerPosition.row = rowIndex;
                    this._playerPosition.col = colIndex;
                    isPlayerPlaced = true;
                } 
                if(isPlayerPlaced) break;
            }
            if(isPlayerPlaced) break;
        }

        // throwing error if player couldn't be placed
        if(this._playerPosition.row === -1 || this._playerPosition.col === -1) {
            throw new Error('Can\'t find space to place the player.');
        }
    }

    isHatFound() { return this._foundHat; }

    movePlayerUp() {
        if(this._playerPosition.row - 1 < 0) throw new Error('Attempts to move “outside” the field.');

        const targetPlaceElement = this._fieldArray[this._playerPosition.row - 1][this._playerPosition.col];
        if(targetPlaceElement === hole) throw new Error('Player falls into the "hole".');

        if(targetPlaceElement === hat) this._foundHat = true;

        this._playerPosition.row -= 1;
        this._fieldArray[this._playerPosition.row][this._playerPosition.col] = pathCharacter;
    }

    movePlayerDown() {
        if(this._playerPosition.row + 1 >= this._fieldArray.length) throw new Error('Attempts to move “outside” the field.');

        const targetPlaceElement = this._fieldArray[this._playerPosition.row + 1][this._playerPosition.col];
        if(targetPlaceElement === hole) throw new Error('Player falls into the "hole".');

        if(targetPlaceElement === hat) this._foundHat = true;

        this._playerPosition.row += 1;
        this._fieldArray[this._playerPosition.row][this._playerPosition.col] = pathCharacter;
    }

    movePlayerLeft() {
        if(this._playerPosition.col - 1 < 0) throw new Error('Attempts to move “outside” the field.');

        const targetPlaceElement = this._fieldArray[this._playerPosition.row][this._playerPosition.col - 1];
        if(targetPlaceElement === hole) throw new Error('Player falls into the "hole".');

        if(targetPlaceElement === hat) this._foundHat = true;

        this._playerPosition.col -= 1;
        this._fieldArray[this._playerPosition.row][this._playerPosition.col] = pathCharacter;
    }

    movePlayerRight() {
        if(this._playerPosition.col + 1 >= this._fieldArray[0].length) throw new Error('Attempts to move “outside” the field.');

        const targetPlaceElement = this._fieldArray[this._playerPosition.row][this._playerPosition.col + 1];
        if(targetPlaceElement === hole) throw new Error('Player falls into the "hole".');

        if(targetPlaceElement === hat) this._foundHat = true;

        this._playerPosition.col += 1;
        this._fieldArray[this._playerPosition.row][this._playerPosition.col] = pathCharacter;
    }

    print() {
        let fieldString = '';
        for(let i=0; i < this._fieldArray.length; i+=1) {
            if(i !== 0) fieldString += '\n';
            for(let j=0; j < this._fieldArray[i].length; j+=1) {
                fieldString += this._fieldArray[i][j];
            }
        }
        console.log('Field : \n' + fieldString);
        
    }

    static generateField(length, width, holePercentage) {
        let numOfHoles = Math.floor((length * width) * (holePercentage / 100));

        // generating a plain field
        const field = [];
        for(let i=0; i < length; i++) {
            const row = [];
            for(let j=0; j < width; j++) {
                row.push(fieldCharacter);
            }
            field.push(row);
        }
        
        // placing holes at random places on the field
        while(numOfHoles > 0) {
            let randomRow =  Math.floor(Math.random() * length);
            let randomCol = Math.floor(Math.random() * width);
            if(field[randomRow][randomCol] === fieldCharacter) {
                field[randomRow][randomCol] = hole;
                numOfHoles--;
            }
        }

        // placing hat at a random place on the field
        let isHatPlaced = false;
        while(!isHatPlaced) {
            let randomRow =  Math.floor(Math.random() * length);
            let randomCol = Math.floor(Math.random() * width);
            if(field[randomRow][randomCol] === fieldCharacter) {
                field[randomRow][randomCol] = hat;
                isHatPlaced = true;
            }
        }

        return field;
    }
}


/* ===============================    main    =============================== */
const UP_KEY = 'U';
const DOWN_KEY = 'D';
const RIGHT_KEY = 'R';
const LEFT_KEY = 'L'
const QUIT_KEY = 'Q';

let fieldInstance = null;

const initGame = () => {
    const fieldLength = Number(prompt('Enter length of the field : ').toString().trim());
    if(!fieldLength) {
        console.log('Enter a valid length of the field');
        process.exit(0);
    }

    const fieldWidth = Number(prompt('Enter width of the field : ').toString().trim());
    if(!fieldWidth) {
        console.log('Enter a valid width of the field');
        process.exit(0);
    }

    const holePercentage = Number(prompt('Enter percentage of holes with in the field : ').toString().trim());
    if(!holePercentage) {
        console.log('Enter a valid hole percentage of the field');
        process.exit(0);
    }
    
    fieldInstance = new Field(Field.generateField(fieldLength, fieldWidth, holePercentage));
    fieldInstance.print();

    while(true) {
        printKeysInformation();
        const userInputString = prompt('Which way? ::: ').toString().trim();
    
        try {
            switch (userInputString) {
                case UP_KEY:
                    fieldInstance.movePlayerUp();
                    break;
                case DOWN_KEY:
                    fieldInstance.movePlayerDown();
                    break;
                case LEFT_KEY:
                    fieldInstance.movePlayerLeft();
                    break;
                case RIGHT_KEY:
                    fieldInstance.movePlayerRight();
                    break;
                case QUIT_KEY:
                    console.log('Player has quit the game!');
                    process.exit(0);
                default:
                    console.log('Please enter a valid key : \n')
                    printKeysInformation();
                    break;
            }
            fieldInstance.print();

            if(fieldInstance.isHatFound()) {
                console.log('Wow! You found the hat!!');
                process.exit(0);
            }
        } catch (error) {
            console.log(`Game over : ${error.message}`);
            process.exit(0);
        }
    }
}

const printKeysInformation = () => {
    console.log(`${UP_KEY} -> to move player up`);
    console.log(`${DOWN_KEY} -> to move player down`);
    console.log(`${LEFT_KEY} -> to move player left`);
    console.log(`${RIGHT_KEY} -> to move player right`);
    console.log(`${QUIT_KEY} -> to quit the game`);
}

initGame();