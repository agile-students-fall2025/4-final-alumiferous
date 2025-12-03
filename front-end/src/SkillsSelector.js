import React from "react";

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
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{label}</h3>

            {/*Selected tags */}
            <div className="flex flex-wrap gap-2">
                {selectedskills.map((skill) => (
                    <div key={skill} className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-white">
                        {skill}
                        <button onClick={() => handleRemove(skill)} className="text-lg font-bold hover:opacity-70 transition-opacity">×</button>
                    </div>
                ))}
            </div>
            {/*skill options */}
            <div className="flex flex-wrap gap-2">
                 {/*create buttons form arrays of all unselected skills */}
                {allSkills.filter(skill => !selectedskills.includes(skill)).map(
                    skill => (
                        <button 
                            key={skill}
                            onClick={ () => handleSelect(skill)}
                            className="btn text-sm py-1 px-3"
                        >
                            {skill}
                        </button>
                    )
                )}
            </div>
        </div>
    );
}; export default SkillSelector