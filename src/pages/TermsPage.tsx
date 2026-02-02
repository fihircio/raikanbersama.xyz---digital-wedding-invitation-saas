import React from 'react';

const TermsPage: React.FC = () => {
    return (
        <div className="pt-32 pb-20 min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-8 tracking-tight">
                    Terms of Service
                </h1>
                <div className="prose prose-rose max-w-none text-gray-600 font-sans leading-relaxed">
                    <p className="mb-6 font-light">
                        Last Updated: {new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-gray-800 mt-12 mb-4 italic">1. Agreement to Terms</h2>
                    <p className="mb-6">
                        By accessing or using RaikanBersama.xyz, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-gray-800 mt-12 mb-4 italic">2. Use of Service</h2>
                    <p className="mb-6">
                        RaikanBersama.xyz provides a digital wedding invitation platform. You are responsible for ensuring that any content you upload (images, text, music) does not violate any third-party rights or laws.
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-gray-800 mt-12 mb-4 italic">3. Accounts</h2>
                    <p className="mb-6">
                        When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-gray-800 mt-12 mb-4 italic">4. Payments and Tiers</h2>
                    <p className="mb-6">
                        Certain features of the Service are only available through paid membership tiers (Basic, Premium, Elite). All fees are non-refundable unless required by law.
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-gray-800 mt-12 mb-4 italic">5. Intellectual Property</h2>
                    <p className="mb-6">
                        The Service and its original content, features, and functionality are and will remain the exclusive property of RaikanBersama.xyz and its licensors.
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-gray-800 mt-12 mb-4 italic">6. Limitation of Liability</h2>
                    <p className="mb-6">
                        In no event shall RaikanBersama.xyz, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-gray-800 mt-12 mb-4 italic">7. Governing Law</h2>
                    <p className="mb-6">
                        These Terms shall be governed and construed in accordance with the laws of Malaysia, without regard to its conflict of law provisions.
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-gray-800 mt-12 mb-4 italic">8. Contact</h2>
                    <p className="mb-6">
                        For any questions about these Terms, please contact us at <a href="mailto:support@raikanbersama.xyz" className="text-rose-600 hover:underline">support@raikanbersama.xyz</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
