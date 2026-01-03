import React from 'react';
import AnimatedBackground from '../components/AnimatedBackground.jsx';

const About = () => {
    return (
        <AnimatedBackground>
            <div className="max-w-4xl mx-auto py-8 px-4 md:px-6">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-6">About MR Data Manager</h1>
                    <p className="text-xl text-blue-200 leading-relaxed">
                        Empowering medical representatives with intelligent data management solutions
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="glass-effect p-8 rounded-2xl">
                        <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
                        <p className="text-blue-100 leading-relaxed">
                            To revolutionize pharmaceutical sales tracking by providing comprehensive,
                            user-friendly tools that streamline billing processes and enhance business insights.
                        </p>
                    </div>

                    <div className="glass-effect p-8 rounded-2xl">
                        <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
                        <ul className="text-blue-100 space-y-2">
                            <li>• Automated billing calculations</li>
                            <li>• Doctor visit tracking</li>
                            <li>• Comprehensive reporting</li>
                            <li>• Data export capabilities</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <div className="glass-effect p-8 rounded-2xl">
                        <h2 className="text-3xl font-bold text-white mb-6">Why Choose Us?</h2>
                        <p className="text-blue-100 text-lg leading-relaxed">
                            Built specifically for medical representatives, our platform combines
                            powerful functionality with intuitive design to help you focus on what
                            matters most - building relationships with healthcare professionals.
                        </p>
                    </div>
                </div>
            </div>
        </AnimatedBackground>
    );
};

export default About;