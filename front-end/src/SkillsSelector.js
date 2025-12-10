import React from "react";

//component to render skill selections
const SkillSelector = ({label, allSkills, selectedskills, setSelectedSkills}) => {

    const handleToggle = skill => {
        if(selectedskills.includes(skill)){
            // Remove if already selected
            setSelectedSkills(selectedskills.filter(s => s !== skill));
        } else {
            // Add if not selected
            setSelectedSkills([...selectedskills, skill]);
        }
    };

    return(
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{label}</h3>

            {/* All skills in one grid - selected ones highlighted in blue */}
            <div className="flex flex-wrap gap-2">
                {allSkills.map(skill => {
                    const isSelected = selectedskills.includes(skill);
                    return (
                        <button 
                            key={skill}
                            type="button"
                            onClick={() => handleToggle(skill)}
                            className={`text-sm py-2 px-4 rounded-app font-semibold transition-all ${
                                isSelected 
                                    ? 'bg-primary text-white border-2 border-primary hover:bg-primary-hover' 
                                    : 'bg-white dark:bg-[#2b2b2b] text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary'
                            }`}
                        >
                            {isSelected && <span className="mr-1">✓</span>}
                            {skill}
                        </button>
                    );
                })}
            </div>

            {/* Show count of selected skills */}
            {selectedskills.length > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedskills.length} skill{selectedskills.length !== 1 ? 's' : ''} selected
                </p>
            )}
        </div>
    );
}; export default SkillSelector