import { useContext } from "react";
import { SplitContext, OrientCourse, Runner } from "../../App";
import { useCheckBoxContext } from './CheckboxContext';

interface Props {
    orientCourse: OrientCourse;
}

export const CheckBoxes = ({ orientCourse}: Props) => {
    const splitData = useContext(SplitContext);
    const runnersNames = splitData.runners[orientCourse.key].map((runner: Runner) => (runner.name));

    const { selectedRunners, setSelectedRunners } = useCheckBoxContext();

    const handleCheckboxChange = (runnerId: number) => {
        if (selectedRunners[orientCourse.key].includes(runnerId)) {
          setSelectedRunners(selectedRunners.map((row, index) => 
          (index === orientCourse.key ? row.filter(id => id !== runnerId) : row)));
        } else {
          setSelectedRunners(selectedRunners.map((row, index) => 
          (index === orientCourse.key ? [...row, runnerId] : row)));
        }
    };

    return (
        <div className="runner-selection">
            <div className="text" style={{fontSize: '16px', alignItems: "center", fontWeight: 'bold'}}>
               Runners
            </div>
            <div className="checkboxes">
                {splitData.runners[orientCourse.key].map((runner) => (
                    <label key={runner.id}>
                
                        <input
                            type="checkbox"
                            key={runner.id}
                            checked={selectedRunners[orientCourse.key].includes(runner.id)}
                            onChange={() => handleCheckboxChange(runner.id)}
                        />
                        {runner.splits.length < splitData.controls[orientCourse.key].length 
                            ? runner.place.toString().padEnd(5, ' ') + runner.overall_time.padEnd(8, ' ') + runner.name 
                            : (runner.place.toString() + ")").padEnd(5, ' ') + runner.overall_time.padEnd(8, ' ') + runner.name }
                        
                    </label>
                    
                ))}
            </div>
            <div 
                className="buttons"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '150px',
                    justifyContent: 'center', 
                    margin: '0 auto', // Add this to center the container horizontally
                }}>
                <button 
                    onClick={() => setSelectedRunners(selectedRunners.map((row, index) => (
                        index === orientCourse.key 
                        ? Array.from({ length: 5 }, (_, index) => index)
                        : row
                    )))}>
                    Select first 5
                </button>
                <button 
                    onClick={() => setSelectedRunners(selectedRunners.map((row, index) => (
                        index === orientCourse.key 
                        ? Array.from({ length: splitData.runners[orientCourse.key].length }, (_, index) => index) 
                        : row
                    )))}>
                    Select all
                </button>
                <button 
                    onClick={() => setSelectedRunners(selectedRunners.map((row, index) => 
                        (index === orientCourse.key ? [] : row)))}>
                    Clear all
                </button>
            </div>
        </div>
        
    );
}
