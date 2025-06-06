import React, { useState } from 'react';
import { Popover } from 'antd';
import { isoControlsData } from '../../utils/isoControlsData';

const InteractiveIsoClause = ({ isoClause }) => {
    const [openPopover, setOpenPopover] = useState(null);

    if (!isoClause || isoClause === "No Clause") {
        return <span>No Clause</span>;
    }

    // Parse the comma-separated ISO clause string into individual control numbers
    const controlNumbers = isoClause.split(',').map(control => control.trim());

    const handleControlClick = (controlNo) => {
        setOpenPopover(openPopover === controlNo ? null : controlNo);
    };

    return (
        <span>
            {controlNumbers.map((controlNo, index) => {
                const controlData = isoControlsData[controlNo];

                // If control data exists, make it clickable with popover
                if (controlData) {
                    const popoverContent = (
                        <div className="max-w-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {controlData.name}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {controlData.desc}
                            </p>
                        </div>
                    );

                    return (
                        <React.Fragment key={controlNo}>
                            <Popover
                                content={popoverContent}
                                title={`ISO Control ${controlNo}`}
                                trigger="click"
                                open={openPopover === controlNo}
                                onOpenChange={() => handleControlClick(controlNo)}
                                placement="bottom"
                            >
                                <span className="cursor-pointer hover:text-purple-600 transition-colors duration-200">
                                    {controlNo}
                                </span>
                            </Popover>
                            {index < controlNumbers.length - 1 && <span>, </span>}
                        </React.Fragment>
                    );
                }

                // If no control data, display as plain text
                return (
                    <React.Fragment key={controlNo}>
                        <span>{controlNo}</span>
                        {index < controlNumbers.length - 1 && <span>, </span>}
                    </React.Fragment>
                );
            })}
        </span>
    );
};

export default InteractiveIsoClause; 