import React from "react";
import "./SkillSelector.css"

//component to render skill selections
const SkillSelector = ({label, allSkills, selectedskills, setSelectedSkills}) => {

    const handleSelect = skill => {
        if(!selectedskills.includes(skill)){
            setSelectedSkills([...selectedskills,skill])
        }
    }
    const handleRemove = skill => {
        //remove the deleted skill form the array of selected skills
        setSelectedSkills(selectedskills.filter(s => s!==skill));
    };

    

    return(
        <div className="skills-selector">
            <h3>{label}</h3>

            {/*Selected tags */}
            <div className="selected-skills">
                {selectedskills.map((skill) => (
                    <div key={skill} className="skill-tag">
                        {skill}
                        <button onClick={() => handleRemove(skill)} className="remove-btn">×</button>
                    </div>
                ))}
            </div>
            {/*skill options */}
            <div className="skills-options">
                 {/*create buttons form arrays of all unselected skills */}
                {allSkills.filter(skill => !selectedskills.includes(skill)).map(
                    skill => (
                        <button 
                            key={skill}
                            onClick={ () => handleSelect(skill)}
                            className="skill-option"
                        >
                            {skill}
                        </button>
                    )
                )}
            </div>
        </div>
    );
}; export default SkillSelector