import React, { useContext, useState, useRef, useCallback, useEffect } from 'react'
import { AuthContext } from '../../../contexts/authContext';
import { FaUser, FaLock, FaBell, FaEnvelope, FaShieldAlt, FaEye, FaEyeSlash, FaEdit, FaCheck, FaTimes, FaKey, FaSignOutAlt } from 'react-icons/fa';
import { PhotoIcon } from '@heroicons/react/24/solid';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../../utils/cropImage';
import 'react-easy-crop/react-easy-crop.css';
import useDebounce from '../../../hooks/useDebounce';
import MessageBox from '../../common/MessageBox';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const AccountSettingsTab = React.memo(() => {

  const { user, setUser } = useContext(AuthContext);

  // State for image cropping
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropperModal, setShowCropperModal] = useState(false);

  // State for languages
  const [profileLanguages, setProfileLanguages] = useState(user.profile?.languages || []);
  const [newLanguage, setNewLanguage] = useState('');
  const [filteredLanguages, setFilteredLanguages] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [initialLanguages, setInitialLanguages] = useState(user.profile?.languages || []); // To track changes for languages

  const debouncedNewLanguage = useDebounce(newLanguage, 500);

  // State for message box
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState('success');


  const [hasChanges, setHasChanges] = useState(false);

  // Effect to check for changes in imageSrc and profileLanguages
  useEffect(() => {
    const languagesChanged = JSON.stringify(profileLanguages.sort()) !== JSON.stringify(initialLanguages.sort());
    setHasChanges(imageSrc !== null || languagesChanged);
  }, [imageSrc, profileLanguages, initialLanguages]);

  // Comprehensive list of languages (can be moved to a separate file if it grows too large)
  const allLanguages = [
    "Afrikaans", "Albanian", "Amharic", "Arabic", "Armenian", "Azerbaijani",
    "Basque", "Belarusian", "Bengali", "Bosnian", "Bulgarian", "Burmese",
    "Catalan", "Cebuano", "Chichewa", "Chinese (Simplified)", "Chinese (Traditional)",
    "Corsican", "Croatian", "Czech", "Danish", "Dutch", "English", "Esperanto",
    "Estonian", "Filipino", "Finnish", "French", "Frisian", "Galician", "Georgian",
    "German", "Greek", "Gujarati", "Haitian Creole", "Hausa", "Hawaiian", "Hebrew",
    "Hindi", "Hmong", "Hungarian", "Icelandic", "Igbo", "Indonesian", "Irish",
    "Italian", "Japanese", "Javanese", "Kannada", "Kazakh", "Khmer", "Kinyarwanda",
    "Korean", "Kurdish (Kurmanji)", "Kyrgyz", "Lao", "Latin", "Latvian", "Lithuanian",
    "Luxembourgish", "Macedonian", "Malagasy", "Malay", "Malayalam", "Maltese",
    "Maori", "Marathi", "Mongolian", "Myanmar (Burmese)", "Nepali", "Norwegian",
    "Odia (Oriya)", "Pashto", "Persian", "Polish", "Portuguese", "Punjabi", "Romanian",
    "Russian", "Samoan", "Scottish Gaelic", "Serbian", "Sesotho", "Shona", "Sindhi",
    "Sinhala", "Slovak", "Slovenian", "Somali", "Spanish", "Sundanese", "Swahili",
    "Swedish", "Tajik", "Tamil", "Tatar", "Telugu", "Thai", "Turkish", "Turkmen",
    "Ukrainian", "Urdu", "Uyghur", "Uzbek", "Vietnamese", "Welsh", "Xhosa", "Yiddish",
    "Yoruba", "Zulu"
  ].sort(); // Sort alphabetically

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result);
        setShowCropperModal(true);
        setHasChanges(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    const formData = new FormData();
    let hasImageChange = false;
    let hasLanguageChange = false;

    // Handle cropped image if available
    if (imageSrc && croppedAreaPixels) {
      hasImageChange = true;
      try {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        const response = await fetch(croppedImage);
        const blob = await response.blob();
        formData.append('profileImage', blob, 'profile.jpeg');
      } catch (error) {
        console.error('Error cropping image:', error);
        // Show error message
        setMessageText(`Error cropping image: ${error.message}`);
        setMessageType('error');
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 5000);
        return;
      }
    }

    // Append languages if they have changed
    const languagesChanged = JSON.stringify(profileLanguages.sort()) !== JSON.stringify(initialLanguages.sort());
    if (languagesChanged) {
      hasLanguageChange = true;
      formData.append('languages', JSON.stringify(profileLanguages));
    }

    // Only send request if there are changes to image or languages
    if (hasImageChange || hasLanguageChange) {
      try {
        const uploadResponse = await fetch(`${API_URL}/api/patient/update-account-profile`, {
          method: 'PUT',
          body: formData,
          credentials: 'include',
        });

        const data = await uploadResponse.json();

        if (uploadResponse.ok) {
          console.log('Profile updated successfully:', data);
          // Update AuthContext with new profile image and languages
          setUser(prevUser => ({
            ...prevUser,
            profile: {
              ...prevUser.profile,
              profileImage: data.profile?.profileImage !== undefined ? data.profile.profileImage : prevUser.profile?.profileImage,
              languages: data.profile?.languages !== undefined ? data.profile.languages : prevUser.profile?.languages,
            }
          }));
          setInitialLanguages(profileLanguages);
          setShowCropperModal(false);
          setImageSrc(null);
          setHasChanges(false);

          // Show success message
          setMessageText('Profile updated successfully!');
          setMessageType('success');
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 3000);

        } else {
          console.error('Failed to update profile:', data.message);
          // Show error message
          setMessageText(`Failed to update profile: ${data.message || 'Unknown error'}`);
          setMessageType('error');
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 5000);
        }
      } catch (error) {
        console.error('Error saving profile:', error);
        // Show error message
        setMessageText(`Error saving profile: ${error.message}`);
        setMessageType('error');
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 5000);
      }
    } else {
      console.log('No changes to save.');
      setHasChanges(false); // Reset changes status
      // Optionally, show a message if no changes were made
      setMessageText('No changes detected.');
      setMessageType('info');
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    }
  };

  const handleAddLanguage = () => {
    if (newLanguage.trim() !== '' && !profileLanguages.includes(newLanguage.trim())) {
      const updatedLanguages = [...profileLanguages, newLanguage.trim()];
      setProfileLanguages(updatedLanguages);
      setNewLanguage('');
      setFilteredLanguages([]); // Clear suggestions after adding
      // No direct backend call here, save will happen via handleSaveChanges
    }
  };

  const handleRemoveLanguage = (langToRemove) => {
    const updatedLanguages = profileLanguages.filter(lang => lang !== langToRemove);
    setProfileLanguages(updatedLanguages);
    // No direct backend call here, save will happen via handleSaveChanges
  };

  const handleLanguageInputChange = (e) => {
    const input = e.target.value;
    setNewLanguage(input);
    setShowSuggestions(true);
  };

  // Effect to filter languages based on debounced input
  useEffect(() => {
    if (debouncedNewLanguage.length > 0) {
      const filtered = allLanguages.filter(lang =>
        lang.toLowerCase().includes(debouncedNewLanguage.toLowerCase()) &&
        !profileLanguages.includes(lang)
      );
      setFilteredLanguages(filtered);
    } else {
      setFilteredLanguages([]);
    }
  }, [debouncedNewLanguage, profileLanguages]);

  const handleSelectLanguage = (language) => {
    setNewLanguage(language);
    setFilteredLanguages([]);
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    if (newLanguage.length > 0 || filteredLanguages.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <img
              src={user.profile?.profileImage ? `${API_URL}${user.profile.profileImage.startsWith('/') ? '' : '/'}${user.profile.profileImage}` : "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?w=740&t=st=1693113479~exp=1693114079~hmac=740079bac9bac9709276b095b4d1410b49850d0d9b1c27e95efcad33ad86ce483e26"}
              alt="Patient Profile"
              className="w-full h-full rounded-full border-4 border-[#007E85] object-cover"
            />
            <label htmlFor="profile-photo-upload" className="absolute bottom-0 right-0 bg-[#007E85] text-white rounded-full p-2 cursor-pointer hover:bg-[#006b6f] transition-colors">
              <PhotoIcon className="h-4 w-4" />
              <input
                id="profile-photo-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
            </label>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 capitalize">{user.fullName}</h2>
            <p className="text-gray-500">Patient</p>
            <p className="text-sm text-gray-500 mt-1">
              <FaEnvelope className="inline mr-2" />
              {user ? user.email : 'Loading...'}
            </p>
          </div>
        </div>
      </div>

      {/* Languages Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg text-gray-800 mb-4">Speaking Languages</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {profileLanguages.map((lang, index) => (
            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#007E85]/10 text-[#007E85]">
              {lang}
              <button type="button" onClick={() => handleRemoveLanguage(lang)} className="ml-2 -mr-0.5 h-4 w-4 inline-flex items-center justify-center rounded-full text-[#007E85] hover:bg-[#007E85] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007E85]">
                <span className="sr-only">Remove language</span>
                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                </svg>
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={newLanguage}
            onChange={handleLanguageInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Add new language"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
          />
          <button
            onClick={handleAddLanguage}
            className="bg-[#007E85] text-white py-2 px-6 rounded-lg hover:bg-[#006b6f] transition-colors"
          >
            Add Language
          </button>
          {showSuggestions && filteredLanguages.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto top-full mt-1">
              {filteredLanguages.map((lang, index) => (
                <li
                  key={index}
                  onClick={() => handleSelectLanguage(lang)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {(() => {
                    const lowerCaseLang = lang.toLowerCase();
                    const lowerCaseDebouncedInput = debouncedNewLanguage.toLowerCase();
                    const startIndex = lowerCaseLang.indexOf(lowerCaseDebouncedInput);

                    if (startIndex === -1) {
                      return lang;
                    }

                    const endIndex = startIndex + lowerCaseDebouncedInput.length;
                    const beforeMatch = lang.substring(0, startIndex);
                    const match = lang.substring(startIndex, endIndex);
                    const afterMatch = lang.substring(endIndex);

                    return (
                      <>
                        {beforeMatch}
                        <span className="font-bold">{match}</span>
                        {afterMatch}
                      </>
                    );
                  })()}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropperModal && imageSrc && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 !mt-0">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full relative">
            <h3 className="text-xl font-bold mb-4">Crop Profile Image</h3>
            <div className="relative w-full" style={{ height: '300px' }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                showGrid={true}
                restrictPosition={false}
              />
            </div>
            <div className="flex justify-between items-center mt-4">
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowCropperModal(false);
                  setImageSrc(null);
                }}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 rounded-md bg-[#007E85] text-white hover:bg-[#006b6f] transition-colors"
              >
                Crop & Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Changes Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSaveChanges}
          disabled={!hasChanges} // Disable if no changes
          className={`py-3 px-8 rounded-lg font-semibold transition-colors ${hasChanges ? 'bg-[#007E85] text-white hover:bg-[#006b6f]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          Update All Changes
        </button>
      </div>

      {/* Message Box */}
      {showMessage && (
        <MessageBox type={messageType} message={messageText} onClose={() => setShowMessage(false)} />
      )}
    </div>
  );
})

export default AccountSettingsTab