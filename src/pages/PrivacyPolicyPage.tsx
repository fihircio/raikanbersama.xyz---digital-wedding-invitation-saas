import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className="pt-32 pb-20 min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-8 tracking-tight">
                    Privacy Policy
                </h1>
                <div className="prose prose-rose max-w-none text-gray-600 font-sans leading-relaxed">
                    <p className="mb-6 font-light">
                        Effective Date: {new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-gray-800 mt-12 mb-4 italic">1. Introduction</h2>
                    <p className="mb-6">
                        Welcome to RaikanBersama.xyz. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-gray-800 mt-12 mb-4 italic">2. The Data We Collect</h2>
                    <p className="mb-4">
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                    </p>
                    <ul className="list-disc pl-6 mb-6 space-y-2">
                        <li><strong>Identity Data:</strong> includes first name, last name, and profile picture (when provided via Google OAuth).</li>
                        <li><strong>Contact Data:</strong> includes email address and phone number.</li>
                        <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
                        <li><strong>Invitation Data:</strong> includes details provided for the creation of invitations, such as event location, date, and RSVP details of guests.</li>
                    </ul>

                    <h2 className="text-2xl font-serif font-bold text-gray-800 mt-12 mb-4 italic">3. Google OAuth Data</h2>
                    <p className="mb-6">
                        When you log in via Google, we use the <strong>userinfo.email</strong> and <strong>userinfo.profile</strong> scopes to retrieve your primary email address and basic profile information (name and profile picture). We use this data only to create and manage your account. We do not sell or share this data with third parties for marketing purposes.
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-gray-800 mt-12 mb-4 italic">4. How We Use Your Data</h2>
                    <p className="mb-4">
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                    </p>
                    <ul className="list-disc pl-6 mb-6 space-y-2">
                        <li>To register you as a new customer.</li>
                        <li>To process and deliver your digital invitation services.</li>
                        <li>To manage our relationship with you.</li>
                        <li>To improve our website, products/services, and customer experiences.</li>
                    </ul>

                    <h2 className="text-2xl font-serif font-bold text-gray-800 mt-12 mb-4 italic">5. Data Security</h2>
                    <p className="mb-6">
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-gray-800 mt-12 mb-4 italic">6. Contact Us</h2>
                    <p className="mb-6">
                        If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:support@raikanbersama.xyz" className="text-rose-600 hover:underline">support@raikanbersama.xyz</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
