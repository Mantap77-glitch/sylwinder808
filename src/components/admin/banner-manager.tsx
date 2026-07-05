"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Badge } from "@/components/ui/badge";

type BannerRow = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  href: string | null;
  placement: string;
  isActive: boolean;
  sortOrder: number;
};

type FormState = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  placement: string;
  isActive: string;
  sortOrder: string;
};

const emptyForm: FormState = {
  id: "",
  title: "",
  subtitle: "",
  href: "",
  placement: "home",
  isActive: "true",
  sortOrder: "0",
};

export function BannerManager({ banners }: { banners: BannerRow[] }) {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const isEdit = Boolean(form.id);

  const filteredBanners = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return banners;

    return banners.filter((banner) => {
      return (
        banner.title.toLowerCase().includes(keyword) ||
        banner.placement.toLowerCase().includes(keyword) ||
        banner.subtitle?.toLowerCase().includes(keyword)
      );
    });
  }, [banners, search]);

  function updateForm(key: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleEdit(banner: BannerRow) {
    setForm({
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle ?? "",
      href: banner.href ?? "",
      placement: banner.placement,
      isActive: String(banner.isActive),
      sortOrder: String(banner.sortOrder),
    });

    setImageFile(null);
    setPreviewUrl(banner.imageUrl ?? "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleReset() {
    setForm(emptyForm);
    setImageFile(null);
    setPreviewUrl("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Title banner wajib diisi.");
      return;
    }

    if (!form.placement.trim()) {
      toast.error("Placement wajib dipilih.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

if (form.id) {
  formData.append("id", form.id);
}

formData.append("title", form.title);
formData.append("subtitle", form.subtitle);
formData.append("href", form.href);
formData.append("placement", form.placement);
formData.append("isActive", form.isActive);
formData.append("sortOrder", form.sortOrder || "0");

if (imageFile) {
  formData.append("image", imageFile);
}

const response = await fetch("/api/admin/settings/banners", {
  method: isEdit ? "PATCH" : "POST",
  body: formData,
}); 

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(result?.message || "Gagal menyimpan banner.");
        return;
      }

      toast.success(result?.message || "Banner berhasil disimpan.");
      setForm(emptyForm);
      setImageFile(null);
      setPreviewUrl("");
      router.refresh();
    } catch {
      toast.error("Server tidak dapat dihubungi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(banner: BannerRow) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus banner "${banner.title}"?`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/settings/banners?id=${banner.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(result?.message || "Gagal menghapus banner.");
        return;
      }

      toast.success(result?.message || "Banner berhasil dihapus.");

      if (form.id === banner.id) {
        setForm(emptyForm);
      }

      router.refresh();
    } catch {
      toast.error("Server tidak dapat dihubungi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Banner" : "Tambah Banner"}</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
                className="bg-white text-slate-950"
                placeholder="Contoh: Promo Home Banner"
              />
            </div>

            <div className="space-y-2">
              <Label>Placement</Label>
              <SelectNative
                value={form.placement}
                onChange={(event) =>
                  updateForm("placement", event.target.value)
                }
                className="bg-white text-slate-950"
              >
                <option value="home">Banner</option>
              </SelectNative>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Subtitle</Label>
              <Input
                value={form.subtitle}
                onChange={(event) =>
                  updateForm("subtitle", event.target.value)
                }
                className="bg-white text-slate-950"
                placeholder="Deskripsi singkat banner"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Upload Image</Label>
              <Input
                type="file"
                accept="image/*"
                className="bg-white text-slate-950"
                onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;

                    setImageFile(file);

                    if (file) {
                        setPreviewUrl(URL.createObjectURL(file));
                    }
                }}
                />
              <p className="text-xs text-slate-500">
                Upload gambar banner ukuran 340px.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Href / Link</Label>
              <Input
                value={form.href}
                onChange={(event) => updateForm("href", event.target.value)}
                className="bg-white text-slate-950"
                placeholder="/promotion atau https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <SelectNative
                value={form.isActive}
                onChange={(event) =>
                  updateForm("isActive", event.target.value)
                }
                className="bg-white text-slate-950"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </SelectNative>
            </div>

            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(event) =>
                  updateForm("sortOrder", event.target.value)
                }
                className="bg-white text-slate-950"
                placeholder="0"
              />
            </div>

            {previewUrl && (
              <div className="space-y-2 md:col-span-2">
                <Label>Preview</Label>
                <div className="overflow-hidden rounded-2xl border bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt={form.title || "Banner preview"}
                    className="max-h-[260px] w-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row">
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Menyimpan..."
                  : isEdit
                    ? "Update Banner"
                    : "Tambah Banner"}
              </Button>

              {isEdit && (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={loading}
                  onClick={handleReset}
                >
                  Batal Edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Daftar Banner</CardTitle>
              <p className="text-sm text-slate-500">
                Total banner tampil: {filteredBanners.length}
              </p>
            </div>

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-white text-slate-950 md:w-80"
              placeholder="Search banner..."
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-2xl border">
            <table className="w-full min-w-[1000px] text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="p-3">Banner</th>
                  <th className="p-3">Placement</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Sort</th>
                  <th className="p-3">Image</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredBanners.map((banner) => (
                  <tr key={banner.id} className="border-t hover:bg-slate-50">
                    <td className="p-3">
                      <p className="font-bold text-slate-950">
                        {banner.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {banner.subtitle || "-"}
                      </p>
                      {banner.href && (
                        <p className="mt-1 text-xs text-indigo-600">
                          {banner.href}
                        </p>
                      )}
                    </td>

                    <td className="p-3">
                      <Badge variant="secondary" className="bg-slate-100">
                        {banner.placement}
                      </Badge>
                    </td>

                    <td className="p-3">
                      <span
                        className={
                          banner.isActive
                            ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700"
                            : "rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700"
                        }
                      >
                        {banner.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="p-3 text-slate-700">
                      {banner.sortOrder}
                    </td>

                    <td className="p-3">
                      {banner.imageUrl ? (
                        <div className="h-16 w-28 overflow-hidden rounded-xl border bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-slate-400">No image</span>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEdit(banner)}
                        >
                          Edit
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(banner)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredBanners.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-slate-500"
                    >
                      Belum ada banner.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}