import React from 'react';
import GCU_BG from '../assets/images/gcu-home.jpg';

const Dashboard = () => {

  const rules = {
    roles: [
      {
        role: 'Student',
        rules: [
          'Follow the guidelines for FYP.',
          'Request meetings with the supervisor.',
          'Complete tasks assigned by the supervisor.'
        ]
      },
      {
        role: 'Supervisor',
        rules: [
          'Assign tasks to students.',
          'Track project progress.',
          'Schedule meetings with students.',
          'Provide feedback to students.'
        ]
      },
      // Commented out the admin section as requested
      /*
      {
        role: 'Admin',
        rules: [
          'Verify student registration.',
          'Monitor overall project progress.',
          'Ensure the timely submission of projects.'
        ]
      }
      */
    ]
  };

  const capitalize = (word) => {
    return word[0].toUpperCase() + word.slice(1, word.length);
  };

  return (
    <div className="relative min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${GCU_BG})` }}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <div className="relative container mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-screen space-y-8">
        
        {/* Hero Section */}
        <div className="text-center text-white space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">FYP PROCTORING</h1>
          <p className="text-lg sm:text-xl px-6 sm:px-12 max-w-3xl mx-auto">
            FYP proctoring is a centralized platform that provides students with complete guidelines regarding the FYP process, its rules, and regulations. Students can communicate with their supervisor throughout the process and can request meetings. Supervisors have authority to assign tasks, manage project progress, provide feedback, and schedule meetings with their students. Additionally, the administration is responsible for student registration, verification, and tracking progress of all final year projects.
          </p>
        </div>

        {/* Rules Section */}
        <div className="w-full sm:w-4/5 md:w-3/4 lg:w-2/3 p-8 space-y-6">
          {rules.roles.map((elm, index) => (
            <div className="mb-6" key={index}>
              <h2 className="text-2xl text-white font-semibold">{capitalize(elm.role)}</h2>
              <ul className="list-disc pl-6 text-white space-y-2">
                {elm.rules.map((rule, ruleIndex) => (
                  <li key={ruleIndex}>{rule}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
