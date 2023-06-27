import React from 'react'

const TabNavItem = ({ id, title, color, activeTab, setActiveTab }) => {
	const handleClick = () => {
		setActiveTab(id);
	};

	return (
		<li onClick={handleClick} className={"py-2 md:px-5 px-2 text-sm text-white font-medium cursor-pointer z-10 " + (activeTab === id ? "bg-primary-900 rounded-lg" : "")}>
			{title}
		</li>
	)
}

export default TabNavItem