import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';


export const generatePatientPdf = (userData) => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text(`${userData.role === 'doctor' ? 'Doctor Profile Report' : 'Patient Medical Report'}`, 105, 20, null, null, 'center');

    doc.setFontSize(12);
    let yPos = 40;

    const addSectionTitle = (title) => {
        doc.setFontSize(16);
        doc.text(title, 10, yPos);
        yPos += 7;
        doc.setLineWidth(0.5);
        doc.line(10, yPos, 200, yPos);
        yPos += 10;
        doc.setFontSize(12);
    };

    const addField = (label, value) => {
        if (value) {
            doc.text(`${label}: ${value}`, 10, yPos);
            yPos += 7;
        }
    };

    // Common Information for both roles
    addSectionTitle('Personal Information');
    addField('Full Name', userData.fullName);
    addField('Email', userData.email);
    addField('Phone Number', userData.phoneNumber);
    addField('Gender', userData.gender || 'N/A'); // Gender might not be present for doctor initially
    addField('Date of Birth', userData.profile?.dateOfBirth ? new Date(userData.profile.dateOfBirth).toLocaleDateString() : '');
    addField('Languages', userData.profile?.languages?.join(', '));
    yPos += 10;

    if (userData.role === 'patient') {
        // Patient-specific Information
        addField('Blood Group', userData.profile?.bloodGroup);
        addField('Height', userData.profile?.height ? `${userData.profile.height} cm` : '');
        addField('Weight', userData.profile?.weight ? `${userData.profile.weight} kg` : '');
        yPos += 10;

        // Emergency Contact
        addSectionTitle('Emergency Contact');
        addField('Name', userData.profile?.emergencyContact?.name);
        addField('Relationship', userData.profile?.emergencyContact?.relationship);
        addField('Phone Number', userData.profile?.emergencyContact?.phoneNumber);
        addField('Email', userData.profile?.emergencyContact?.email);
        yPos += 10;

        // Medical Conditions
        if (userData.profile?.medicalConditions?.length > 0) {
            addSectionTitle('Medical Conditions');
            const conditionsData = userData.profile.medicalConditions.map(condition => [condition]);
            autoTable(doc, {
                startY: yPos,
                head: [['Condition']],
                body: conditionsData,
                theme: 'grid',
                styles: { fillColor: [240, 240, 240] },
                headStyles: { fillColor: [0, 126, 133], textColor: [255, 255, 255] },
            });
            yPos = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : yPos + 40;
        }

        // Allergies
        if (userData.profile?.allergies?.length > 0) {
            addSectionTitle('Allergies');
            const allergiesData = userData.profile.allergies.map(allergy => [allergy]);
            autoTable(doc, {
                startY: yPos,
                head: [['Allergy']],
                body: allergiesData,
                theme: 'grid',
                styles: { fillColor: [240, 240, 240] },
                headStyles: { fillColor: [0, 126, 133], textColor: [255, 255, 255] },
            });
            yPos = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : yPos + 40;
        }

        // Medications
        if (userData.profile?.medications?.length > 0) {
            addSectionTitle('Medications');
            const medicationsData = userData.profile.medications.map(medication => [
                medication.name,
                medication.dosage,
                new Date(medication.startDate).toLocaleDateString(),
                new Date(medication.endDate).toLocaleDateString(),
                medication.isActive ? 'Yes' : 'No',
            ]);
            autoTable(doc, {
                startY: yPos,
                head: [['Name', 'Dosage', 'Start Date', 'End Date', 'Active']],
                body: medicationsData,
                theme: 'grid',
                styles: { fillColor: [240, 240, 240] },
                headStyles: { fillColor: [0, 126, 133], textColor: [255, 255, 255] },
            });
            yPos = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : yPos + 40;
        }

        // Health Metrics
        if (userData.profile?.healthMetrics?.length > 0) {
            addSectionTitle('Health Metrics');
            const healthMetricsData = userData.profile.healthMetrics.map(metric => [
                metric.type,
                `${metric.value} ${metric.unit}`,
                new Date(metric.date).toLocaleDateString(),
                metric.notes,
            ]);
            autoTable(doc, {
                startY: yPos,
                head: [['Type', 'Value', 'Date', 'Notes']],
                body: healthMetricsData,
                theme: 'grid',
                styles: { fillColor: [240, 240, 240] },
                headStyles: { fillColor: [0, 126, 133], textColor: [255, 255, 255] },
            });
            yPos = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : yPos + 40;
        }

        // Wellness Program
        if (userData.profile?.wellnessProgram) {
            addSectionTitle('Wellness Program');
            addField('Dietary Preference', userData.profile.wellnessProgram.dietaryPreference);
            yPos += 10;
        }

        // Insurance Information
        if (userData.profile?.insurance) {
            addSectionTitle('Insurance Information');
            addField('Provider', userData.profile.insurance.provider);
            addField('Policy Number', userData.profile.insurance.policyNumber);
            addField('Valid Until', userData.profile.insurance.validUntil ? new Date(userData.profile.insurance.validUntil).toLocaleDateString() : '');
            yPos += 10;
        }

        // Communication Preferences
        if (userData.profile?.communicationPreferences) {
            addSectionTitle('Communication Preferences');
            addField('Appointment Reminders', userData.profile.communicationPreferences.appointmentReminders ? 'Yes' : 'No');
            addField('Marketing Emails', userData.profile.communicationPreferences.marketingEmails ? 'Yes' : 'No');
            addField('Newsletter Subscription', userData.profile.communicationPreferences.newsletterSubscription ? 'Yes' : 'No');
            yPos += 10;
        }
    } else if (userData.role === 'doctor') {
        // Doctor-specific Information
        addField('Specialization', userData.profile?.specialization);
        addField('Qualification', userData.profile?.qualification);
        addField('Experience', userData.profile?.experience ? `${userData.profile.experience} Years` : '');
        addField('Registration Number', userData.profile?.registrationNumber);
        addField('Consultation Price', userData.profile?.consultationPrice ? `$${userData.profile.consultationPrice}` : '');
        yPos += 10;

        // Bio
        if (userData.profile?.bio) {
            addSectionTitle('Bio');
            doc.text(userData.profile.bio, 10, yPos, { maxWidth: 190 });
            const textLines = doc.splitTextToSize(userData.profile.bio, 190);
            yPos += (textLines.length * doc.getLineHeight()) + 5; 
        }
        yPos += 10;

        // Availability
        if (userData.profile?.availability?.recurringWeekly?.length > 0 || userData.profile?.availability?.dateSpecific?.length > 0) {
            addSectionTitle('Availability');

            const availabilityData = [];
            if (userData.profile.availability.recurringWeekly?.length > 0) {
                userData.profile.availability.recurringWeekly.forEach(slot => {
                    availabilityData.push(['Recurring Weekly', slot.dayOfWeek, `${slot.startTime} - ${slot.endTime}`]);
                });
            }
            if (userData.profile.availability.dateSpecific?.length > 0) {
                userData.profile.availability.dateSpecific.forEach(slot => {
                    availabilityData.push(['Date Specific', new Date(slot.date).toLocaleDateString(), `${slot.startTime} - ${slot.endTime}`]);
                });
            }

            if (availabilityData.length > 0) {
                autoTable(doc, {
                    startY: yPos,
                    head: [['Type', 'Day/Date', 'Time']],
                    body: availabilityData,
                    theme: 'grid',
                    styles: { fillColor: [240, 240, 240] },
                    headStyles: { fillColor: [0, 126, 133], textColor: [255, 255, 255] },
                });
                yPos = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : yPos + 40; 
            } else {
                // If no availability data, still advance yPos to prevent overlap with next section
                yPos += 30; // A reasonable default space if no table is drawn
            }
        }
    }

    doc.save(`${userData.firstName}_${userData.lastName}_${userData.role === 'doctor' ? 'ProfileReport' : 'MedicalReport'}.pdf`);
}; 