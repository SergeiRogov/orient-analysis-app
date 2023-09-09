import { useContext } from "react";
import { SplitContext, OrientCourse, Runner } from "./../App"
import Canvas from "../components/Canvas"
import { CheckBoxes } from "../components/checkboxes/CheckBoxes"
import { useCheckBoxContext } from '../components/checkboxes/CheckboxContext';
import { divideSegment } from "../Utils/divideSegment"
import { secondsToTime } from "../Utils/secondsToTime"
import '../styles/styles.css';

const CANVAS_HEIGHT = 650;
const CANVAS_WIDTH = 1070;

const MARGIN_TOP = 30;
const MARGIN_BOTTOM = 40;
const MARGIN_LEFT = 70;
const MARGIN_RIGHT = 210;

const BEHIND_LINES_COUNT = 12;

interface Props {
    orientCourse: OrientCourse;
}

export const Graphs = ({ orientCourse }: Props) => {
    const splitData = useContext(SplitContext);

    const { selectedRunners } = useCheckBoxContext();

    const bestSplits = splitData.controls[orientCourse.key].map((_ , index) => {
        return splitData.runners[orientCourse.key].reduce((minValue, runner) => {
            const splitTime: number = runner?.splits?.[index]?.[5];
            return splitTime !== undefined ? Math.min(minValue, splitTime) : minValue;
        }, Infinity);
    });

    const runnersToDisplay = splitData.runners[orientCourse.key].filter(
        runner => selectedRunners[orientCourse.key].includes(runner.id)
    );

    const bestCumulSelected = splitData.controls[orientCourse.key].map((_ , index) => {
        return runnersToDisplay.reduce((minValue, runner) => {
            const cumulTime: number = runner?.splits?.[index]?.[6];
            return cumulTime !== undefined ? Math.min(minValue, cumulTime) : minValue;
        }, Infinity);
    });

    const worstCumulSelected = splitData.controls[orientCourse.key].map((_ , index) => {
        return runnersToDisplay.reduce((maxValue, runner) => {
            const cumulTime: number = runner?.splits?.[index]?.[6];
            return cumulTime !== undefined ? Math.max(maxValue, cumulTime) : maxValue;
        }, -Infinity); // Initialize with negative infinity
    });

    const differences = splitData.controls[orientCourse.key].map((runner, index) => {
        return worstCumulSelected[index] - bestCumulSelected[index]
    });

    const maxBehind = Math.max(...differences);

    const lineColors = 
    [   '#d90000', // red
        '#1510f0', // blue
        '#f2b705', // yellow
        '#512da8', // purple
        '#2e7d32', // green 5
        '#d23600', // orange
        '#5c0002', // red
        '#00305a', // blue
        '#f2600c', // orange
        '#4c1273', // purple 10
        '#45bf55', // green
        '#ef5350', // red
        '#04bfbf', // blue
        '#fa5b0f', // orange
        '#9c27b0', // purple 15
        '#0eeaff', // blue
        '#36175e', // purple
        '#012840', // blue 18
    ];

    const drawGraph = (ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // Clear the canvas

        const graphWidth = CANVAS_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
        const graphHeight = CANVAS_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;

        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // control coordinates 
        const verticalLinesCoordinates = divideSegment(bestSplits, graphWidth);
        
        ctx.strokeStyle = 'grey';
        ctx.lineWidth = 1;
        // control vertical lines
        verticalLinesCoordinates.forEach((x: number) => {
            ctx.beginPath();
            ctx.moveTo(x + MARGIN_LEFT, MARGIN_TOP);
            ctx.lineTo(x + MARGIN_LEFT, MARGIN_TOP + graphHeight);
            ctx.stroke();
        });
        ctx.fillStyle = 'black';
        
        ctx.font = '13px Open Sans';
        verticalLinesCoordinates.slice(1).forEach((x: number, index: number) => {
            ctx.fillText(
                index === verticalLinesCoordinates.length - 2 ? "F" : (index + 1).toString() , 
                x + MARGIN_LEFT - 3, 
                graphHeight + MARGIN_TOP + 20);
        });

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;

        // top horizontal border
        ctx.beginPath();
        ctx.moveTo(MARGIN_LEFT, MARGIN_TOP);
        ctx.lineTo(MARGIN_LEFT + graphWidth, MARGIN_TOP);
        ctx.stroke();

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;

        // bottom horizontal border
        ctx.beginPath();
        ctx.moveTo(MARGIN_LEFT, MARGIN_TOP + graphHeight);
        ctx.lineTo(MARGIN_LEFT + graphWidth, MARGIN_TOP + graphHeight);
        ctx.stroke();

        // left vertical border
        ctx.beginPath();
        ctx.moveTo(MARGIN_LEFT, MARGIN_TOP);
        ctx.lineTo(MARGIN_LEFT, MARGIN_TOP + graphHeight);
        ctx.stroke();
        
        // right vertical border
        ctx.beginPath();
        ctx.moveTo(MARGIN_LEFT + graphWidth, MARGIN_TOP);
        ctx.lineTo(MARGIN_LEFT + graphWidth, MARGIN_TOP + graphHeight);
        ctx.stroke();

        ctx.strokeStyle = 'grey';
        ctx.lineWidth = 1;
        const interval = graphHeight / BEHIND_LINES_COUNT;
        const timeInterval = maxBehind / BEHIND_LINES_COUNT;
        // 'behind' horizontal lines
        for(let i = 0; i <= BEHIND_LINES_COUNT; i++){
            ctx.beginPath();
            ctx.moveTo(MARGIN_LEFT, i*interval + MARGIN_TOP);
            ctx.lineTo(MARGIN_LEFT + graphWidth, i*interval + MARGIN_TOP);
            ctx.stroke();
            if (selectedRunners[orientCourse.key].length > 1) {
                ctx.fillStyle = 'black';
                ctx.font = '13px Open Sans';
                ctx.fillText('+' + secondsToTime(Math.floor(i*timeInterval)).toString(), MARGIN_LEFT/5, i*interval + MARGIN_TOP + 5);
            }
        }
        let Ycoordinate = 0;
        let prevYcoordinate = MARGIN_TOP;
        let curentYcoordinate = 0
        // runners
        ctx.lineWidth = 2;
        runnersToDisplay.forEach((runner: Runner, runnerIndex) => {
            const colorIndex = runnerIndex % lineColors.length;
            ctx.strokeStyle = lineColors[colorIndex];
            let startY = 0;
            runner.splits.forEach((split, index) => {
                ctx.beginPath();
                ctx.moveTo(verticalLinesCoordinates[index] + MARGIN_LEFT, startY + MARGIN_TOP);
                const behindBestCumul: number = split[6] - bestCumulSelected[index];
                Ycoordinate = behindBestCumul / maxBehind * graphHeight;
                ctx.lineTo(verticalLinesCoordinates[index+1] + MARGIN_LEFT, Ycoordinate + MARGIN_TOP);
                startY = Ycoordinate;
                ctx.stroke();

                // Draw a small circle at the data point
                ctx.beginPath();
                ctx.arc(verticalLinesCoordinates[index + 1] + MARGIN_LEFT, Ycoordinate + MARGIN_TOP, 3, 0, Math.PI * 2);
                ctx.fillStyle = lineColors[colorIndex];
                ctx.fill();
            });
            // text with names
            if (selectedRunners[orientCourse.key].length > 1 && runnersToDisplay[runnerIndex].splits.length > 0) {
                ctx.fillStyle = lineColors[colorIndex];
                ctx.font = '13px Open Sans';
                curentYcoordinate = MARGIN_TOP + Ycoordinate;
                if (runnerIndex > 0 && prevYcoordinate + 13 > curentYcoordinate){  
                    curentYcoordinate = prevYcoordinate + 13
                }
                if (runnersToDisplay[runnerIndex].splits.length < splitData.controls[orientCourse.key].length) {
                    curentYcoordinate = MARGIN_TOP + graphHeight;
                    if (runnerIndex > 0 && prevYcoordinate + 12 > curentYcoordinate){  
                        curentYcoordinate = prevYcoordinate + 12
                    }
                    ctx.fillText(
                        (runnersToDisplay[runnerIndex].name).toString(), 
                        MARGIN_LEFT + graphWidth + 7, 
                        curentYcoordinate );
                    prevYcoordinate = curentYcoordinate;
                } else {
                    ctx.fillText(
                        (runnersToDisplay[runnerIndex].name).toString(), 
                        MARGIN_LEFT + graphWidth + 7, 
                        curentYcoordinate );
                    prevYcoordinate = curentYcoordinate;
                }
            }
        })
    }

    return (
        <div className="graph-page"
            style={{ position: 'relative', display: 'flex' }}
            >

            <div className="checkbox"
                style={{ 
                position: 'absolute', 
                width: '320px', 
                height: '100%', 
                top: 0, 
                fontFamily: 'Open Sans', 
                fontWeight: 300, 
                fontSize: '14px', }}>
                <CheckBoxes orientCourse={ orientCourse }/>
            </div>

            <div className="graph" >
                <div className="text"
                style={{fontSize: '16px', marginTop: '10px', fontWeight: 'bold'}}>
                    {splitData.title + " " + orientCourse.name}
                </div>
                <div className="canvas">
                    <Canvas draw={(ctx) => drawGraph(ctx)} orientCourse={orientCourse} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}/>
                </div>
            </div>

        </div>
    );
}