import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Spinner from "../ui/Spinner";
import { addressService } from "../../api/addressService";
import { locationService } from "../../api/locationService";
import { useConfirm } from "../../hooks/useConfirm";

const EMPTY_FORM = {
  addressLine1: "",
  addressLine2: "",
  countryId: "",
  stateId: "",
  cityId: "",
  postalCode: "",
  phoneNumber: "",
  isDefault: false,
  // Temporary fields to hold names from DTO during editing
  tempCountryName: "",
  tempStateName: "",
  tempCityName: "",
};

export default function AddressesSection() {
  const { confirm } = useConfirm();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [settingDefaultId, setSettingDefaultId] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await addressService.getAll();
      setAddresses(res.data || []);
    } catch {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setEditingId(address.addressId);
    setShowModal(true);
  };

  
  const handleDelete = (addressId) => {
    confirm({
      message: "Delete this address?",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          setDeletingId(addressId);
          await addressService.delete(addressId);
          toast.success("Address deleted");
          fetchAddresses();
        } catch {
          toast.error("Failed to delete address");
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const handleSetDefault = async (addressId) => {
    try {
      setSettingDefaultId(addressId);
      await addressService.setDefault(addressId);
      toast.success("Default address updated");
      fetchAddresses();
    } catch {
      toast.error("Failed to set default");
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSaved = () => {
    handleModalClose();
    fetchAddresses();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-800">
          My Addresses
          <span className="ml-2 text-xs text-gray-400 font-normal">
            {addresses.length} saved
          </span>
        </h2>
        <button
          onClick={() => {
            setEditingId(null);
            setShowModal(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm
            font-medium px-4 py-2 rounded-xl transition cursor-pointer"
        >
          + Add Address
        </button>
      </div>

      {addresses.length === 0 && (
        <div
          className="bg-white border border-gray-200 rounded-2xl p-10
          text-center text-gray-400"
        >
          <div className="text-4xl mb-3">📍</div>
          <p className="font-medium text-gray-600">No addresses saved</p>
          <p className="text-sm mt-1">Add an address to use during checkout</p>
        </div>
      )}

      <div className="space-y-3">
        {addresses.map((addr) => (
          <div
            key={addr.addressId}
            className={`bg-white border rounded-2xl p-5 transition
              ${
                addr.isDefault
                  ? "border-indigo-300 bg-indigo-50/30"
                  : "border-gray-200"
              }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {addr.isDefault && (
                  <span
                    className="inline-block text-xs bg-indigo-100 text-indigo-600
                    px-2 py-0.5 rounded-full font-medium mb-2"
                  >
                    Default
                  </span>
                )}
                <p className="text-sm font-medium text-gray-800">
                  {addr.addressLine1}
                </p>
                {addr.addressLine2 && (
                  <p className="text-sm text-gray-500">{addr.addressLine2}</p>
                )}
                <p className="text-sm text-gray-500 mt-0.5">
                  {[addr.cityName, addr.stateName, addr.countryName]
                    .filter(Boolean)
                    .join(", ")}
                  {addr.postalCode && ` — ${addr.postalCode}`}
                </p>
                {addr.phoneNumber && (
                  <p className="text-sm text-gray-400 mt-0.5">
                    📞 {addr.phoneNumber}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => handleEdit(addr)}
                  className="text-xs text-indigo-600 border border-indigo-200
                    hover:border-indigo-400 px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  Edit
                </button>
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.addressId)}
                    disabled={settingDefaultId === addr.addressId}
                    className="text-xs text-gray-500 border border-gray-200
                      hover:border-gray-400 px-3 py-1.5 rounded-lg transition
                      disabled:opacity-40 cursor-pointer"
                  >
                    {settingDefaultId === addr.addressId
                      ? "..."
                      : "Set Default"}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(addr.addressId)}
                  disabled={deletingId === addr.addressId}
                  className="text-xs text-red-500 border border-red-200
                    hover:border-red-400 px-3 py-1.5 rounded-lg transition
                    disabled:opacity-40 cursor-pointer"
                >
                  {deletingId === addr.addressId ? "..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <AddressModal
          editingId={editingId}
          onClose={handleModalClose}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

function AddressModal({ editingId, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // 1. Initial Load: Countries
  useEffect(() => {
    locationService
      .getCountries()
      .then((res) => setCountries(res.data || []))
      .catch(() => toast.error("Failed to load countries"));
  }, []);

  // 2. Initial Load: If editing, fetch address details (strings only)
  useEffect(() => {
    if (!editingId) return;
    addressService
      .getById(editingId)
      .then((res) => {
        const a = res.data;
        setForm({
          addressLine1: a.addressLine1 || "",
          addressLine2: a.addressLine2 || "",
          postalCode: a.postalCode || "",
          phoneNumber: a.phoneNumber || "",
          isDefault: a.isDefault || false,
          countryId: "",
          stateId: "",
          cityId: "",
          tempCountryName: a.countryName,
          tempStateName: a.stateName,
          tempCityName: a.cityName,
        });
      })
      .catch(() => toast.error("Failed to load address details"));
  }, [editingId]);

  // 3. Name Matcher: Find Country ID from Name
  useEffect(() => {
    if (countries.length > 0 && form.tempCountryName && !form.countryId) {
      const match = countries.find(
        (c) => c.countryName === form.tempCountryName,
      );
      if (match)
        setForm((prev) => ({ ...prev, countryId: String(match.countryId) }));
    }
  }, [countries, form.tempCountryName]);

  // 4. Loader: States (when countryId is known)
  useEffect(() => {
    if (!form.countryId) {
      setStates([]);
      setCities([]);
      return;
    }
    setLoadingLocation(true);
    locationService
      .getStatesByCountry(form.countryId)
      .then((res) => setStates(res.data || []))
      .catch(() => toast.error("Failed to load states"))
      .finally(() => setLoadingLocation(false));
  }, [form.countryId]);

  // 5. Name Matcher: Find State ID from Name
  useEffect(() => {
    if (states.length > 0 && form.tempStateName && !form.stateId) {
      const match = states.find((s) => s.stateName === form.tempStateName);
      if (match)
        setForm((prev) => ({ ...prev, stateId: String(match.stateId) }));
    }
  }, [states, form.tempStateName]);

  // 6. Loader: Cities (when stateId is known)
  useEffect(() => {
    if (!form.stateId) {
      setCities([]);
      return;
    }
    setLoadingLocation(true);
    locationService
      .getCitiesByState(form.stateId)
      .then((res) => setCities(res.data || []))
      .catch(() => toast.error("Failed to load cities"))
      .finally(() => setLoadingLocation(false));
  }, [form.stateId]);

  // 7. Name Matcher: Find City ID from Name
  useEffect(() => {
    if (cities.length > 0 && form.tempCityName && !form.cityId) {
      const match = cities.find((c) => c.cityName === form.tempCityName);
      if (match) setForm((prev) => ({ ...prev, cityId: String(match.cityId) }));
    }
  }, [cities, form.tempCityName]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "countryId") {
      setForm((prev) => ({
        ...prev,
        countryId: value,
        stateId: "",
        cityId: "",
        tempStateName: "",
        tempCityName: "",
      }));
    } else if (name === "stateId") {
      setForm((prev) => ({
        ...prev,
        stateId: value,
        cityId: "",
        tempCityName: "",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.addressLine1.trim())
      return toast.error("Address line 1 is required");
    if (!form.countryId) return toast.error("Country is required");
    if (!form.stateId) return toast.error("State is required");
    if (!form.cityId) return toast.error("City is required");
    if (!form.postalCode.trim()) return toast.error("Postal code is required");

    const payload = {
      addressLine1: form.addressLine1,
      addressLine2: form.addressLine2 || null,
      countryId: Number(form.countryId),
      stateId: Number(form.stateId),
      cityId: Number(form.cityId),
      postalCode: form.postalCode,
      phoneNumber: form.phoneNumber || null,
      isDefault: form.isDefault,
    };

    try {
      setSaving(true);
      if (editingId) {
        await addressService.update(editingId, payload);
        toast.success("Address updated");
      } else {
        await addressService.create(payload);
        toast.success("Address added");
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 my-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-gray-900 text-lg">
            {editingId ? "Edit Address" : "Add New Address"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Address Line 1 *"
            name="addressLine1"
            value={form.addressLine1}
            onChange={handleChange}
            placeholder="House no, Street, Area"
          />
          <FormField
            label="Address Line 2"
            name="addressLine2"
            value={form.addressLine2}
            onChange={handleChange}
            placeholder="Landmark, Apartment (optional)"
          />

          <SelectField
            label="Country *"
            name="countryId"
            value={form.countryId}
            onChange={handleChange}
            options={countries.map((c) => ({
              value: String(c.countryId),
              label: c.countryName,
            }))}
            placeholder="Select country"
          />
          <SelectField
            label="State *"
            name="stateId"
            value={form.stateId}
            onChange={handleChange}
            options={states.map((s) => ({
              value: String(s.stateId),
              label: s.stateName,
            }))}
            placeholder={
              form.countryId ? "Select state" : "Select country first"
            }
            disabled={!form.countryId || loadingLocation}
          />
          <SelectField
            label="City *"
            name="cityId"
            value={form.cityId}
            onChange={handleChange}
            options={cities.map((c) => ({
              value: String(c.cityId),
              label: c.cityName,
            }))}
            placeholder={form.stateId ? "Select city" : "Select state first"}
            disabled={!form.stateId || loadingLocation}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Postal Code *"
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              placeholder="e.g. 380001"
            />
            <FormField
              label="Phone Number"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="+91 9876543210"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isDefault"
              checked={form.isDefault}
              onChange={handleChange}
              className="w-4 h-4 accent-indigo-600"
            />
            <span className="text-sm text-gray-700">
              Set as default address
            </span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition disabled:opacity-50 cursor-pointer"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Address"
                  : "Save Address"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-indigo-500"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-indigo-500 bg-white disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const confirmDelete = (onConfirm) => {
  toast((t) => (
    <div className="flex flex-col gap-2">
      <p className="text-sm">Delete this image?</p>

      <div className="flex gap-2 justify-end">
        <button
          onClick={() => {
            toast.dismiss(t.id);
          }}
          className="px-3 py-1 text-sm border rounded"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            onConfirm();
            toast.dismiss(t.id);
          }}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded"
        >
          Delete
        </button>
      </div>
    </div>
  ));
};
