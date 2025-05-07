import React from "react";

export default function LawsAndRegulationsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-white/90 shadow-xl rounded-2xl border border-gray-100 p-8 sm:p-10">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-primary-700 tracking-tight drop-shadow-sm">
          Laws & Regulations: Animal Welfare & Adoption in India
        </h1>
        <section className="mb-10 bg-primary-50 rounded-xl p-6 border-l-4 border-primary-300 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-2xl font-semibold text-primary-800">General Rules for Pet Adoption & Ownership</h2>
          </div>
          <ul className="list-disc pl-7 space-y-2 text-gray-800">
            <li><b>Adopt Responsibly:</b> Only adopt if you can provide lifelong care, love, and attention to an animal.</li>
            <li><b>Registration:</b> Register your pet with local authorities/municipality as required by law.</li>
            <li><b>Vaccination & Health:</b> Ensure your pet is vaccinated, dewormed, and receives regular veterinary care. Maintain vaccination records.</li>
            <li><b>Sterilization:</b> Spay/neuter your pet to prevent unwanted litters and control stray populations.</li>
            <li><b>Identification:</b> Use a collar and tag with your contact details. Microchipping is recommended.</li>
            <li><b>Leash & Control:</b> Keep dogs on a leash in public spaces and clean up after them. Prevent pets from causing nuisance or harm.</li>
            <li><b>Prohibition of Cruelty:</b> It is illegal to abandon, abuse, or neglect any animal. Provide adequate food, water, shelter, and exercise.</li>
            <li><b>Reporting Cruelty:</b> If you witness cruelty or neglect, report it to local authorities or animal welfare organizations immediately.</li>
          </ul>
          <p className="mt-4 text-sm text-gray-600 italic">
            <b>Note:</b> These rules are based on Indian laws and guidelines. Always check with your local municipality for specific requirements.
          </p>
        </section>
        <div className="border-t border-gray-200 my-8" />
        <section className="mb-10 bg-yellow-50 rounded-xl p-6 border-l-4 border-yellow-300 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-2xl font-semibold text-yellow-900">Key Legal Requirements</h2>
          </div>
          <ul className="list-disc pl-7 space-y-2 text-gray-800">
            <li><b>Pet Shop Regulation:</b> Only purchase/adopt from licensed breeders or shelters. Pet shops must be registered under the Prevention of Cruelty to Animals (Pet Shop) Rules, 2018.</li>
            <li><b>Stray Animal Care:</b> Feeding and caring for strays is permitted, but must not cause public nuisance. Animal Birth Control (ABC) Rules apply to stray dog management.</li>
            <li><b>Transport:</b> Transport animals humanely, following the Transport of Animals Rules, 1978 and amendments.</li>
            <li><b>Wildlife:</b> It is illegal to keep wild/exotic animals as pets without proper permits under the Wildlife Protection Act, 1972.</li>
            <li><b>Noise & Disturbance:</b> Prevent pets from excessive barking or disturbances, especially in apartment complexes (refer to RWA guidelines).</li>
          </ul>
        </section>
        <div className="border-t border-gray-200 my-8" />
        <section className="mb-6 bg-green-50 rounded-xl p-6 border-l-4 border-green-300 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-2xl font-semibold text-green-900">Ethical Guidelines & Best Practices</h2>
          </div>
          <ul className="list-disc pl-7 space-y-2 text-gray-800">
            <li>Adopt, don’t shop—give homeless animals a loving home.</li>
            <li>Never abandon a pet. If you cannot care for your animal, contact a shelter or rescue group for help.</li>
            <li>Socialize and train your pet with positive reinforcement.</li>
            <li>Educate children and family about responsible pet care.</li>
            <li>Support and volunteer with local animal welfare organizations.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
