import React from 'react';
import { Loader2, Upload } from 'lucide-react';
import TiptapEditor from './TiptapEditor';

const BlogForm = ({ form, onChange, photoPreview, onPhotoChange, onSubmit, onCancel, saving, isEdit }) => (
  <form
    onSubmit={e => { e.preventDefault(); onSubmit(); }}
    className="space-y-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
  >
    <div>
      <label className="text-sm font-bold block mb-1">Título *</label>
      <input
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D166]"
        value={form.titulo}
        onChange={e => onChange({ ...form, titulo: e.target.value })}
        required
      />
    </div>

    <div>
      <label className="text-sm font-bold block mb-1">Subtítulo</label>
      <input
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D166]"
        value={form.subTitulo}
        onChange={e => onChange({ ...form, subTitulo: e.target.value })}
      />
    </div>

    <div>
      <label className="text-sm font-bold block mb-1">Conteúdo</label>
      <TiptapEditor value={form.conteudo} onChange={c => onChange({ ...form, conteudo: c })} />
    </div>

    <div>
      <label className="text-sm font-bold block mb-1">Conclusão</label>
      <textarea
        className="w-full p-2 border rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-[#00D166]"
        value={form.conclusao}
        onChange={e => onChange({ ...form, conclusao: e.target.value })}
      />
    </div>

    <div>
      <label className="text-sm font-bold block mb-1">Imagem</label>
      <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 w-fit">
        <Upload size={16} />
        <span className="text-sm">Upload Imagem</span>
        <input type="file" className="hidden" accept="image/*" onChange={onPhotoChange} />
      </label>
      {photoPreview && (
        <img src={photoPreview} alt="preview" className="mt-3 h-36 rounded-xl object-cover border" />
      )}
    </div>

    <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
      <input
        type="checkbox"
        className="w-5 h-5 rounded"
        checked={form.ativo}
        onChange={e => onChange({ ...form, ativo: e.target.checked })}
      />
      <span className="font-bold text-sm">Ativo (exibir no site)</span>
    </label>

    <div className="flex justify-end gap-3 pt-2">
      <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
        Cancelar
      </button>
      <button
        type="submit"
        disabled={saving}
        className="px-5 py-2 bg-[#0E3A2F] text-white rounded-lg font-bold hover:bg-[#165945] disabled:opacity-50 flex items-center gap-2"
      >
        {saving && <Loader2 size={16} className="animate-spin" />}
        {isEdit ? 'Salvar alterações' : 'Criar post'}
      </button>
    </div>
  </form>
);

export default BlogForm;
